import { z, ZodError } from "zod";
import { privateProcedure, publicProcedure, router } from "./trpc";
import {
  announcementSchema,
  assignmentSchema,
  assignModuleSchema,
  moduleSchema,
  profileSchema,
  resourceSchema,
  studentSchema,
  submitAssignmentSchema,
} from "@/lib/validator/zodValidation";
import { dbConnect } from "@/lib/db";
import Module, { TModule } from "@/model/module";
import { groupSchema } from "@/lib/validator/zodValidation";
import Group, { TGroup } from "@/model/group";
import { teacherSchema } from "@/lib/validator/zodValidation";
import UserModel, { TUser } from "@/model/user";
import AssignModule, { TAssignModule } from "@/model/assignModule";
import { UTApi } from "uploadthing/server";
import { TRPCError } from "@trpc/server";
import TeacherModuleResource, {
  TTeacherModuleResource,
} from "@/model/resource";
import Assignment, { TAssignment } from "@/model/assignment";
import SubmitWork, { TSubmitWork } from "@/model/submitWork";
import TeacherModuleAnnouncement, {
  TTeacherModuleAnnouncement,
} from "@/model/announcement";
import { resend } from "@/lib/resend";
import { formatDate } from "@/lib/formatDate";

const utapi = new UTApi();

const deleteFile = async (imageUrl: string) => {
  try {
    const keyFromTheImageUrl = imageUrl.split("/").pop();
    await utapi.deleteFiles(keyFromTheImageUrl!);
    // console.log("image deleted: ", keyFromTheImageUrl);
  } catch (err) {
    console.error("Error deleting file:", err);
  }
};

const deleteFilesByKeys = async (keys: string[]) => {
  try {
    await utapi.deleteFiles(keys);
  } catch (err) {
    console.error("Error deleting files:", err);
  }
};

const sendEmail = (from: string, to: string, subject: string, html: string) => {
  try {
    return resend.emails.send({
      from,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Error sending email:", err);
  }
};
export const appRouter = router({
  getUserData: privateProcedure.query(async ({ ctx }) => {
    const { user } = ctx;
    await dbConnect();
    const findUser: TUser | null = await UserModel.findById(user.id).select(
      "-password"
    );
    return findUser;
  }),
  updateProfile: privateProcedure
    .input(profileSchema)
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx;
      console.log("input for update profie : ", input);
      await dbConnect();
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new TRPCError({
          message: "User not found",
          code: "NOT_FOUND",
        });
      }
      if (input.image) {
        if (user.image) {
          await deleteFile(user.image);
        }
        user.image = input.image;
      }
      user.name = input.name;
      user.email = input.email;
      user.username = input.username;
      user.bio = input.bio;
      await user.save();
      return { user, message: "Profile updated" };
    }),
  createSumbitAssignment: privateProcedure
    .input(submitAssignmentSchema)
    .mutation(async ({ input, ctx }) => {
      const { user, userId } = ctx;
      await dbConnect();
      const assignment = await Assignment.findOne({ _id: input.assignmentId });
      if (!assignment) {
        throw new TRPCError({
          message: "Assignment not found",
          code: "NOT_FOUND",
        });
      }
      const currentDate = new Date();
      let status = "Missing";
      if (currentDate <= new Date(assignment.dueDate)) {
        status = "On Time";
      } else {
        status = "Late";
      }
      const submitWork = await SubmitWork.create({
        ...input,
        files: input.files?.map((file) => ({
          name: file.name,
          url: file.url,
          key: file.key,
        })),
        studentObjectId: input.studentId,
        assignmentObjectId: input.assignmentId,
        moduleObjectId: input.moduleId,
        groupObjectId: input.groupId,
        status,
      });
      await submitWork.save();
      return { submitWork, message: "Assignment submitted" };
    }),
  createAssignments: privateProcedure
    .input(assignmentSchema)
    .mutation(async ({ input, ctx }) => {
      const { user, userId } = ctx;
      console.log("createAssignments", input);
      await dbConnect();
      const assignment = await Assignment.create({
        ...input,
        files: input.files?.map((file) => ({
          name: file.name,
          url: file.url,
          key: file.key,
        })),
        moduleObjectId: input.moduleId,
        teacherObjectId: input.teacherId,
        groupObjectId: input.groupId,
        createdBy: userId,
      });

      // fetch all students associated with the group
      const students = await UserModel.find({
        group: input.groupId,
        role: "student",
      });
      // send email to each student
      const emailPromises = students.map(async (student) => {
        try {
          const teacher = await UserModel.findById(input.teacherId);
          const module = await Module.findById(input.moduleId);
          const dueDate = input.dueDate
            ? formatDate(input.dueDate.toISOString()) // Convert Date to string
            : "No due date provided";
          const html = ` 
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
                  <h2 style="color: #4CAF50; text-align: center;">New Assignment Added</h2>
                  <p>Dear <strong>${student.name}</strong>,</p>
                  <p>A new assignment titled <strong>${input.title}</strong> has been added to your group by <strong>${teacher?.name}</strong> in the module <strong>${module?.name}</strong>.</p>
                  <p>Due Date: <strong>${dueDate}</strong></p>
                  <p style="text-align: center; margin: 20px 0;">
                    <a href="http://localhost:3000/dashboard/module/${input.moduleId}/assignments" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">View Assignment</a>
                  </p>
                  <p>If you have any questions, feel free to contact your teacher.</p>
                  <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                  <p style="font-size: 12px; color: #777; text-align: center;">Best regards,<br>Classroom Team</p>
               </div>
               `;
          sendEmail(
            "noreply@mohammedsamrose.com.np",
            student.email,
            "New Assignment Created",
            html
          );
        } catch (err) {
          console.error(`Error sending email to ${student.email}:`, err);
        }
      });
      await Promise.all(emailPromises);
      await assignment.save();
      return { assignment, message: "Assignment created and emails sent" };
    }),
  createModuleAnnouncement: privateProcedure
    .input(announcementSchema)
    .mutation(async ({ input, ctx }) => {
      const { user, userId } = ctx;
      console.log("create announcement", input);
      await dbConnect();
      const tma = await TeacherModuleAnnouncement.create({
        ...input,
        files: input.files?.map((file) => ({
          name: file.name,
          url: file.url,
          key: file.key,
        })),
        moduleObjectId: input.moduleId,
        teacherObjectId: input.teacherId,
        groupObjectId: input.groupId,
        createdBy: userId,
      });
      // Fetch all students associated with the group
      const students = await UserModel.find({
        group: input.groupId,
        role: "student",
      });

      // Send email to each student
      const emailPromises = students.map(async (student) => {
        try {
          const teacher = await UserModel.findById(input.teacherId); // Fetch teacher details
          const module = await Module.findById(input.moduleId); // Fetch module details

          const html = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
            <h2 style="color: #4CAF50; text-align: center;">New Announcement</h2>
            <p>Dear <strong>${student.name}</strong>,</p>
            <p>A new announcement has been added to your group by <strong>${teacher?.name}</strong> in the module <strong>${module?.name}</strong>.</p>
            <p>Description: <strong>${input.description || "No description provided"}</strong></p>
            <p style="text-align: center; margin: 20px 0;">
              <a href="http://localhost:3000/dashboard/module/${input.moduleId}/announcements" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">View Announcement</a>
            </p>
            <p>If you have any questions, feel free to contact your teacher.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 12px; color: #777; text-align: center;">Best regards,<br>Classroom Team</p>
          </div>
        `;

          sendEmail(
            "noreply@mohammedsamrose.com.np",
            student.email,
            "New Announcement Created",
            html
          );
        } catch (err) {
          console.error(`Error sending email to ${student.email}:`, err);
        }
      });

      await Promise.all(emailPromises);
      await tma.save();
      return { tma, message: "Announcement created" };
    }),
  createModuleResource: privateProcedure
    .input(resourceSchema)
    .mutation(async ({ input, ctx }) => {
      const { user, userId } = ctx;
      console.log("create resource input : ", input);
      dbConnect();
      const tmr = await TeacherModuleResource.create({
        ...input,
        files: input.files?.map((file) => ({
          name: file.name,
          url: file.url,
          key: file.key,
        })),
        moduleObjectId: input.moduleId,
        teacherObjectId: input.teacherId,
        groupObjectId: input.groupId,
        createdBy: userId,
      });
      await tmr.save();

      // fetch all users associated with the group
      const users = await UserModel.find({
        group: input.groupId,
        role: "student",
      });
      console.log(users);
      // send email to each user
      const emailPromises = users.map(async (user) => {
        try {
          const teacher = await UserModel.findById(input.teacherId); // Fetch teacher details
          const module = await Module.findById(input.moduleId); // Fetch module details
          const html = `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
                  <h2 style="color: #4CAF50; text-align: center;">New Resource Added</h2>
                  <p>Dear <strong>${user.name}</strong>,</p>
                  <p>A new resource titled <strong>${input.title}</strong> has been added to your group by <strong>${teacher?.name}</strong> in the module <strong>${module?.name}</strong>.</p>
                  <p style="text-align: center; margin: 20px 0;">
                    <a href="http://localhost:3000/dashboard/module/${input.moduleId}/files" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">View Resource</a>
                  </p>
                  <p>If you have any questions, feel free to contact your teacher.</p>
                  <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                  <p style="font-size: 12px; color: #777; text-align: center;">Best regards,<br>Classroom Team</p>
              </div>
            `;
          sendEmail(
            "noreply@mohammedsamrose.com.np",
            user.email,
            "New Resource Created",
            html
          );
          // console.log(`Email sent to ${user.email}:`, response);
        } catch (error) {
          console.error(`Error sending email to ${user.email}:`, error);
        }
      });

      await Promise.all(emailPromises);
      return { tmr, message: "Resource created and emails sent" };
    }),
  createAssignModule: privateProcedure
    .input(assignModuleSchema)
    .mutation(async ({ input, ctx }) => {
      const { user, userId } = ctx;
      dbConnect();
      const existAssignModule = await AssignModule.findOne({
        moduleId: input.moduleId,
        teacher: input.teacher,
        group: input.group,
        createdBy: userId,
      });
      if (existAssignModule) {
        throw new TRPCError({
          message: "Module already assigned to this group and teacher",
          code: "BAD_REQUEST",
        });
      }
      const am = await AssignModule.create({
        ...input,
        createdBy: userId,
      });

      // fetch teacher and module details
      const teacher = await UserModel.findById(input.teacher);
      const module = await Module.findById(input.moduleId);
      const group = await Group.findById(input.group);

      // send email to the teacher
      const html = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
            <h2 style="color: #4CAF50; text-align: center;">Module Assigned</h2>
            <p>Dear <strong>${teacher?.name}</strong>,</p>
            <p>You have been assigned to the module <strong>${module?.name}</strong> for the group <strong>${group?.groupName}</strong>.</p>
            <p>Please log in to your dashboard to view the details.</p>
            <p style="text-align: center; margin: 20px 0;">
              <a href="http://localhost:3000/dashboard/modules" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">View Modules</a>
            </p>
            <p>If you have any questions, feel free to contact the admin.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 12px; color: #777; text-align: center;">Best regards,<br>Admin Team</p>
          </div>
        `;
      try {
        await sendEmail(
          "noreply@mohammedsamrose.com.np",
          teacher?.email!,
          "Module Assigned",
          html
        );
        console.log(`Email sent to ${teacher?.email}`);
      } catch (err) {
        console.error(`Error sending email to ${teacher?.email}:`, err);
      }
      await am.save();
      return { am, message: "Module assigned" };
    }),
  createModule: privateProcedure
    .input(moduleSchema)
    .mutation(async ({ input, ctx }) => {
      const { user, userId } = ctx;
      // console.log(user, userId);
      dbConnect();
      const m = await Module.create({
        ...input,
        createdBy: userId,
      });
      await m.save();
      return { m, message: "Module created" };
    }),
  createGroup: privateProcedure
    .input(groupSchema)
    .mutation(async ({ input, ctx }) => {
      const { user, userId } = ctx;
      dbConnect();
      const existGroupName = await Group.findOne({
        groupName: input.groupName,
        createdBy: userId,
      });
      if (existGroupName) {
        throw new TRPCError({
          message: "Group name already exist",
          code: "BAD_REQUEST",
        });
      }
      const g = await Group.create({
        ...input,
        createdBy: userId,
      });
      await g.save();
      return { g, message: "Group created" };
    }),
  createUserWithTeacher: privateProcedure
    .input(teacherSchema)
    .mutation(async ({ input, ctx }) => {
      const { user, userId } = ctx;
      // console.log("create : ", userId);
      dbConnect();
      const u = await UserModel.create({
        name: input.teacherName,
        email: input.teacherEmail,
        image: input.teacherImage,
        password: input.teacherPassword,
        rollNumber: input.teacherId,
        role: "teacher",
        createdBy: userId,
      });
      await u.save();
      return { u, message: "Teacher created" };
    }),
  createUserWithStudent: privateProcedure
    .input(studentSchema)
    .mutation(async ({ input, ctx }) => {
      const { user, userId } = ctx;
      dbConnect();
      const u = await UserModel.create({
        name: input.studentName,
        email: input.studentEmail,
        image: input.studentImage,
        password: input.studentPassword,
        rollNumber: input.studentId,
        group: input.studentGroup,
        role: "student",
        createdBy: userId,
      });
      await u.save();
      return { u, message: "Student created" };
    }),
  getModuleGroupStats: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;
    await dbConnect();

    // Fetch all modules created by the user
    const modules = await Module.find({ createdBy: userId }).lean();

    // Fetch all groups assigned to these modules
    const assignModules = await AssignModule.find({
      moduleId: { $in: modules.map((module) => module._id) },
    })
      .populate("group")
      .lean();

    // Fetch student counts for each group
    const groupStudentCounts = await UserModel.aggregate([
      {
        $match: {
          role: "student",
          group: { $in: assignModules.map((am) => am?.group?._id) },
        },
      },
      {
        $group: {
          _id: "$group",
          studentCount: { $sum: 1 },
        },
      },
    ]);

    // Map group IDs to student counts
    const groupCountsMap = groupStudentCounts.reduce(
      (acc, group) => {
        acc[group._id.toString()] = group.studentCount;
        return acc;
      },
      {} as Record<string, number>
    );

    // Build the response
    const moduleStats = modules.map((modulee) => {
      const groups = assignModules
        .filter((am) => am?.moduleId?.toString() === modulee._id.toString())
        .map((am) => ({
          name: am?.group?.groupName,
          studentCount: am?.group?._id
            ? groupCountsMap[am.group._id.toString()] || 0
            : 0,
        }));

      return {
        name: modulee.name,
        groups,
      };
    });

    return moduleStats;
  }),
  getCountForTeacher: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;
    await dbConnect();

    // Get total number of module assignments
    const totalModuleAssignments = await AssignModule.countDocuments({
      teacher: userId,
    });

    // Get total number of unique groups assigned
    const uniqueGroupIds = await AssignModule.distinct("group", {
      teacher: userId,
    });

    const totalGroupsAssigned = uniqueGroupIds.length;

    // Get total number of students in the assigned groups
    const totalStudents = await UserModel.countDocuments({
      group: { $in: uniqueGroupIds },
    });

    // Fetch and populate unique group data
    const uniqueGroups: TGroup[] = await Group.find({
      _id: { $in: uniqueGroupIds },
    });

    return {
      totalModuleAssignments,
      totalGroupsAssigned,
      totalStudents,
      uniqueGroups,
    };
  }),
  getCountForAdmin: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;
    await dbConnect();
    const totalGroups = await Group.countDocuments({ createdBy: userId });
    const totalModules = await Module.countDocuments({ createdBy: userId });
    const totalTeachers = await UserModel.countDocuments({
      role: "teacher",
      createdBy: userId,
    });
    const totalStudents = await UserModel.countDocuments({
      role: "student",
      createdBy: userId,
    });
    return {
      totalGroups,
      totalModules,
      totalTeachers,
      totalStudents,
    };
  }),
  getGroupStudentAssignToTeacher: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;
    await dbConnect();
    const am = await AssignModule.find({ teacher: userId })
      .populate("group")
      .populate("teacher")
      .lean();
    const groupIds = am.map((am) => am?.group?._id);
    const students = await UserModel.find({ group: { $in: groupIds } })
      .populate("group")
      .lean();
    const typeResult: TUser[] = students as unknown as TUser[];
    return typeResult;
  }),
  getViewSubmitWorkForTeacher: privateProcedure
    .input(
      z.object({
        moduleId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { user, userId } = ctx;
      await dbConnect();
      const assignModule = await AssignModule.find({
        teacher: userId,
        moduleId: input.moduleId,
      })
        .populate("group")
        .lean();
      console.log("Assign module: ", assignModule);

      // extract group id
      const groupIds = assignModule.map((am) => am?.group?._id);

      const submitWork = await SubmitWork.find({
        moduleObjectId: input.moduleId,
        groupObjectId: { $in: groupIds },
      })
        .populate("assignmentObjectId")
        .populate("studentObjectId")
        .populate("moduleObjectId")
        .populate("groupObjectId")
        .lean();
      console.log("Submit work from api : ", submitWork);
      const typeResult: TSubmitWork[] = submitWork as unknown as TSubmitWork[];
      return typeResult;
    }),
  getViewSubmitWork: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { user, userId } = ctx;
      await dbConnect();
      const submitWork = await SubmitWork.findOne({
        assignmentObjectId: input.id,
        studentObjectId: userId,
      })
        .populate("assignmentObjectId")
        .populate("studentObjectId")
        .populate("moduleObjectId")
        .lean();
      console.log("Submit work from api : ", submitWork);
      const typeResult: TSubmitWork = submitWork as unknown as TSubmitWork;
      return typeResult;
    }),
  getSumbitWork: privateProcedure
    .input(z.object({ moduleId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { userId } = ctx;
      await dbConnect();
      const submitWork = await SubmitWork.find({
        moduleObjectId: input.moduleId,
        studentObjectId: userId,
      })
        .populate("assignmentObjectId")
        .populate("studentObjectId")
        .lean();
      const typeResult: TSubmitWork[] = submitWork as unknown as TSubmitWork[];
      return typeResult;
    }),
  getAssignment: privateProcedure
    .input(z.object({ moduleId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { user, userId } = ctx;
      dbConnect();
      const assignment = await Assignment.find({
        moduleObjectId: input.moduleId,
        createdBy: userId,
      })
        .populate("groupObjectId")
        .populate("teacherObjectId")
        .populate("moduleObjectId")
        .lean();
      const typeResult: TAssignment[] = assignment as unknown as TAssignment[];
      return typeResult;
    }),
  getAnnouncement: privateProcedure
    .input(z.object({ moduleId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { user, userId } = ctx;
      await dbConnect();
      console.log("getAnnouncement", input, userId);
      const announcement = await TeacherModuleAnnouncement.find({
        moduleObjectId: input.moduleId,
        createdBy: userId,
      })
        .populate("groupObjectId")
        .populate("teacherObjectId")
        .populate("moduleObjectId")
        .lean();
      const typeResult: TTeacherModuleAnnouncement[] =
        announcement as unknown as TTeacherModuleAnnouncement[];
      return typeResult;
    }),
  getResourceFile: privateProcedure
    .input(z.object({ moduleId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { user, userId } = ctx;
      await dbConnect();
      const resource = await TeacherModuleResource.find({
        moduleObjectId: input.moduleId,
        createdBy: userId,
      })
        .populate("groupObjectId")
        .populate("teacherObjectId")
        .populate("moduleObjectId")
        .lean();
      const typeResult: TTeacherModuleResource[] =
        resource as unknown as TTeacherModuleResource[];
      return typeResult;
    }),
  getTeachers: privateProcedure.query(async ({ ctx }) => {
    const { userId, user } = ctx;
    // console.log("getTeacher", user, ctx);
    dbConnect();
    const t: TUser[] = await UserModel.find({
      role: "teacher",
      createdBy: userId,
    });
    return t;
  }),
  getStudents: privateProcedure.query(async ({ ctx }) => {
    const { userId, user } = ctx;
    dbConnect();
    const s = await UserModel.find({
      role: "student",
      createdBy: userId,
    })
      .populate("group")
      .lean();
    const typeResult: TUser[] = s as unknown as TUser[];
    return typeResult;
  }),
  getAssignModules: privateProcedure.query(async ({ ctx }) => {
    const { userId, user } = ctx;
    dbConnect();
    const am = await AssignModule.find({ createdBy: userId })
      .populate("moduleId")
      .populate("group")
      .populate("teacher")
      .lean();
    const typeResult: TAssignModule[] = am as unknown as TAssignModule[];
    return typeResult;
  }),
  getModules: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;
    dbConnect();
    const m: TModule[] = await Module.find({ createdBy: userId });
    return m;
  }),
  getGroups: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;
    dbConnect();
    const g: TGroup[] = await Group.find({ createdBy: userId });
    return g;
  }),
  getAssignModuleForTeacher: privateProcedure.query(async ({ ctx }) => {
    const { user, userId } = ctx;
    await dbConnect();
    const am = await AssignModule.find({ teacher: userId })
      .populate("moduleId")
      .populate("group")
      .populate("teacher")
      .lean();
    const typeResult: TAssignModule[] = am as unknown as TAssignModule[];
    return typeResult;
  }),
  getAssignModuleForStudent: privateProcedure.query(async ({ ctx }) => {
    const { user, userId } = ctx;
    await dbConnect();
    const student = await UserModel.findOne({ _id: userId });
    if (!student) {
      throw new TRPCError({
        message: "Student not found",
        code: "NOT_FOUND",
      });
    }
    const am = await AssignModule.find({ group: student.group })
      .populate("moduleId")
      .populate("group")
      .populate("teacher")
      .lean();
    const typeResult: TAssignModule[] = am as unknown as TAssignModule[];
    return typeResult;
  }),
  getAnnounceForStudent: privateProcedure
    .input(
      z.object({
        moduleId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { user, userId } = ctx;
      await dbConnect();
      const student = await UserModel.findOne({ _id: userId });
      if (!student) {
        throw new TRPCError({
          message: "Student not found",
          code: "NOT_FOUND",
        });
      }
      const announcement = await TeacherModuleAnnouncement.find({
        moduleObjectId: input.moduleId,
        groupObjectId: student.group,
      })
        .populate("groupObjectId")
        .populate("teacherObjectId")
        .populate("moduleObjectId")
        .lean();
      const typeResult: TTeacherModuleAnnouncement[] =
        announcement as unknown as TTeacherModuleAnnouncement[];
      return typeResult;
    }),
  getAssignmentForStudent: privateProcedure
    .input(
      z.object({
        moduleId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { user, userId } = ctx;
      await dbConnect();
      const student = await UserModel.findOne({ _id: userId });
      if (!student) {
        throw new TRPCError({
          message: "Student not found",
          code: "NOT_FOUND",
        });
      }
      const assignment = await Assignment.find({
        moduleObjectId: input.moduleId,
        groupObjectId: student.group,
      })
        .populate("groupObjectId")
        .populate("teacherObjectId")
        .populate("moduleObjectId")
        .lean();
      const typeResult: TAssignment[] = assignment as unknown as TAssignment[];
      return typeResult;
    }),
  getModuleResourceForStudent: privateProcedure
    .input(
      z.object({
        moduleId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { user, userId } = ctx;
      await dbConnect();
      const student = await UserModel.findOne({ _id: userId });
      if (!student) {
        throw new TRPCError({
          message: "Student not found",
          code: "NOT_FOUND",
        });
      }
      const resource = await TeacherModuleResource.find({
        moduleObjectId: input.moduleId,
        groupObjectId: student.group,
      })
        .populate("groupObjectId")
        .populate("teacherObjectId")
        .populate("moduleObjectId")
        .lean();
      const typeResult: TTeacherModuleResource[] =
        resource as unknown as TTeacherModuleResource[];
      return typeResult;
    }),
  editModule: privateProcedure
    .input(
      z.object({
        id: z.string(),
        moduleSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { user, userId } = ctx;
      dbConnect();
      await Module.updateOne(
        { _id: input.id, createdBy: userId },
        input.moduleSchema
      );
      return { message: "Module updated" };
    }),
  editGroup: privateProcedure
    .input(z.object({ id: z.string(), groupSchema }))
    .mutation(async ({ input, ctx }) => {
      const { userId, user } = ctx;
      dbConnect();
      await Group.updateOne(
        { _id: input.id, createdBy: userId },
        input.groupSchema
      );
      return { message: "Group updated" };
    }),
  editTeacher: privateProcedure
    .input(
      z.object({
        id: z.string(),
        teacherSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      // console.log("editTeacher", input);
      const { userId, user } = ctx;
      dbConnect();
      const existingTeacher = await UserModel.findOne({
        _id: input.id,
        createdBy: userId,
      });
      if (!existingTeacher) {
        throw new TRPCError({
          message: "Teacher not found or not authorized",
          code: "NOT_FOUND",
        });
      }
      if (input.teacherSchema.teacherImage && existingTeacher.image) {
        if (existingTeacher.image !== input.teacherSchema.teacherImage) {
          await deleteFile(existingTeacher.image);
        }
      }

      const updatedTeacher = await UserModel.findOneAndUpdate(
        { _id: input.id, createdBy: userId },
        {
          name: input.teacherSchema.teacherName,
          email: input.teacherSchema.teacherEmail,
          image: input.teacherSchema.teacherImage,
          password: input.teacherSchema.teacherPassword,
          rollNumber: input.teacherSchema.teacherId,
        },
        { new: true }
      );
      if (!updatedTeacher) {
        throw new TRPCError({
          message: "Teacher no found or not authorized",
          code: "NOT_FOUND",
        });
      }
      return { message: "Teacher updated", updatedTeacher };
    }),
  editStudent: privateProcedure
    .input(
      z.object({
        id: z.string(),
        studentSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId, user } = ctx;
      dbConnect();
      const existingStudent = await UserModel.findOne({
        _id: input.id,
        createdBy: userId,
      });
      if (!existingStudent) {
        throw new TRPCError({
          message: "Student not found or not authorized",
          code: "NOT_FOUND",
        });
      }
      if (input.studentSchema.studentImage && existingStudent.image) {
        if (existingStudent.image !== input.studentSchema.studentImage) {
          await deleteFile(existingStudent.image);
        }
      }
      const updatedStudent = await UserModel.findOneAndUpdate(
        { _id: input.id, createdBy: userId },
        {
          name: input.studentSchema.studentName,
          email: input.studentSchema.studentEmail,
          image: input.studentSchema.studentImage,
          password: input.studentSchema.studentPassword,
          rollNumber: input.studentSchema.studentId,
          group: input.studentSchema.studentGroup,
        },
        { new: true }
      );
      if (!updatedStudent) {
        throw new TRPCError({
          message: "Student not found or not authorized",
          code: "NOT_FOUND",
        });
      }
      return { message: "Student updated", updatedStudent };
    }),
  editAssignModule: privateProcedure
    .input(
      z.object({
        id: z.string(),
        assignModuleSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log("editAssignModule", input);
      const { user, userId } = ctx;
      dbConnect();
      const existingAssignModule = await AssignModule.findOne({
        _id: input.id,
        createdBy: userId,
      });
      if (!existingAssignModule) {
        throw new TRPCError({
          message: "Assign module not found or not authorized",
          code: "NOT_FOUND",
        });
      }

      // Check if the teacher is already assigned to the group
      const duplicateAssignModule = await AssignModule.findOne({
        _id: { $ne: input.id }, // Exclude the current assignment being edited
        teacher: input.assignModuleSchema.teacher,
        group: input.assignModuleSchema.group,
        createdBy: userId,
      });
      if (duplicateAssignModule) {
        throw new TRPCError({
          message: "Teacher is already assigned to this group",
          code: "BAD_REQUEST",
        });
      }
      const updatedAssignModule = await AssignModule.findOneAndUpdate(
        { _id: input.id, createdBy: userId },
        {
          moduleId: input.assignModuleSchema.moduleId,
          teacher: input.assignModuleSchema.teacher,
          group: input.assignModuleSchema.group,
        },
        { new: true }
      );
      if (!updatedAssignModule) {
        throw new TRPCError({
          message: "Assign module not found or not authorized",
          code: "NOT_FOUND",
        });
      }
      return { message: "Assign module updated", updatedAssignModule };
    }),
  editSubmitWork: privateProcedure
    .input(z.object({ id: z.string(), submitAssignmentSchema }))
    .mutation(async ({ input, ctx }) => {
      const { user, userId } = ctx;
      await dbConnect();
      const assignment = await Assignment.findOne({ _id: input.id });
      if (!assignment) {
        throw new TRPCError({
          message: "Assignment not found",
          code: "NOT_FOUND",
        });
      }
      const existingSubmitWork = await SubmitWork.findOne({
        assignmentObjectId: input.id,
        studentObjectId: userId,
      });
      if (!existingSubmitWork) {
        throw new TRPCError({
          message: "Submit work not found or not authorized",
          code: "NOT_FOUND",
        });
      }
      const existingFiles = existingSubmitWork.files || [];
      const newFiles = input.submitAssignmentSchema.files || [];
      const newFileKeys = newFiles.map((file) => file.key);
      const filesToDelete = existingFiles.filter(
        (file) => !newFileKeys.includes(file.key)
      );
      if (filesToDelete.length > 0) {
        const keysToDelete = filesToDelete.map((file) => file.key);
        const res = await deleteFilesByKeys(keysToDelete);
        console.log("Deleted files:", res);
      }

      const currentDate = new Date();
      let status = "Missing";
      if (currentDate <= new Date(assignment.dueDate)) {
        status = "On Time";
      } else {
        status = "Late";
      }
      const updatedSubmitWork = await SubmitWork.findOneAndUpdate(
        {
          assignmentObjectId: input.id,
          studentObjectId: userId,
        },
        {
          ...input.submitAssignmentSchema,
          files: newFiles.map((file) => ({
            name: file.name,
            url: file.url,
            key: file.key,
          })),
          status,
        },
        { new: true }
      );
      if (!updatedSubmitWork) {
        throw new TRPCError({
          message: "Submit work update failed",
          code: "NOT_FOUND",
        });
      }
      return { message: "Submit work updated", updatedSubmitWork };
    }),
  editModuleAnnouncement: privateProcedure
    .input(
      z.object({
        id: z.string(),
        announcementSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx;
      await dbConnect();
      const existingAnnouncement = await TeacherModuleAnnouncement.findOne({
        _id: input.id,
        createdBy: userId,
      });
      if (!existingAnnouncement) {
        throw new TRPCError({
          message: "Announcement not found or not authorized",
          code: "NOT_FOUND",
        });
      }
      const existingFiles = existingAnnouncement.files || [];
      const newFiles = input.announcementSchema.files || [];
      const newFileKeys = newFiles.map((file) => file.key);
      const filesToDelete = existingFiles.filter(
        (file) => !newFileKeys.includes(file.key)
      );
      if (filesToDelete.length > 0) {
        const keysToDelete = filesToDelete.map((file) => file.key);
        const res = await deleteFilesByKeys(keysToDelete);
        console.log("Deleted files:", res);
      }
      const updatedAnnouncement =
        await TeacherModuleAnnouncement.findOneAndUpdate(
          {
            _id: input.id,
            createdBy: userId,
          },
          {
            ...input.announcementSchema,
            groupObjectId: input.announcementSchema.groupId,
            files: newFiles.map((file) => ({
              name: file.name,
              url: file.url,
              key: file.key,
            })),
          },
          { new: true }
        );
      if (!updatedAnnouncement) {
        throw new TRPCError({
          message: "Announcement update failed",
          code: "NOT_FOUND",
        });
      }
      return {
        message: "Announcement updated successfully",
        updatedAnnouncement,
      };
    }),
  editModuleResource: privateProcedure
    .input(
      z.object({
        id: z.string(),
        resourceSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log("editModuleResource: ", input);
      const { userId } = ctx;
      await dbConnect();
      const existingResource = await TeacherModuleResource.findOne({
        _id: input.id,
        createdBy: userId,
      });
      if (!existingResource) {
        throw new TRPCError({
          message: "Resource not found or not authorized",
          code: "NOT_FOUND",
        });
      }
      // Step 1: Identify files to delete
      const existingFiles = existingResource.files || [];
      const newFiles = input.resourceSchema.files || [];
      const newFileKeys = newFiles.map((file) => file.key);
      const filesToDelete = existingFiles.filter(
        (file) => !newFileKeys.includes(file.key)
      );
      if (filesToDelete.length > 0) {
        const keysToDelete = filesToDelete.map((file) => file.key);
        const res = await deleteFilesByKeys(keysToDelete);
        console.log("Deleted files:", res);
      }
      // Step 2: Update the resource with the new file list
      const updatedResource = await TeacherModuleResource.findOneAndUpdate(
        {
          _id: input.id,
          createdBy: userId,
        },
        {
          ...input.resourceSchema,
          groupObjectId: input.resourceSchema.groupId,
          files: newFiles.map((file) => ({
            name: file.name,
            url: file.url,
            key: file.key,
          })),
        },
        { new: true } // return updated resource
      );

      if (!updatedResource) {
        throw new TRPCError({
          message: "Resource update failed",
          code: "NOT_FOUND",
        });
      }

      return { message: "Resource updated successfully", updatedResource };
    }),
  editModuleAssignment: privateProcedure
    .input(
      z.object({
        id: z.string(),
        assignmentSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log("editModuleAssignment: ", input);
      const { userId } = ctx;
      await dbConnect();
      const existingAssignment = await Assignment.findOne({
        _id: input.id,
        createdBy: userId,
      });
      if (!existingAssignment) {
        throw new TRPCError({
          message: "Assignment not found or not authorized",
          code: "NOT_FOUND",
        });
      }

      const existingFiles = existingAssignment.files || [];
      const newFiles = input.assignmentSchema.files || [];
      const newFileKeys = newFiles.map((file) => file.key);
      const filesToDelete = existingFiles.filter(
        (file) => !newFileKeys.includes(file.key)
      );
      if (filesToDelete.length > 0) {
        const keysToDelete = filesToDelete.map((file) => file.key);
        const res = await deleteFilesByKeys(keysToDelete);
        console.log("Deleted files:", res);
      }
      const updatedAssignment = await Assignment.findOneAndUpdate(
        {
          _id: input.id,
          createdBy: userId,
        },
        {
          ...input.assignmentSchema,
          groupObjectId: input.assignmentSchema.groupId,
          files: newFiles.map((file) => ({
            name: file.name,
            url: file.url,
            key: file.key,
          })),
        },
        { new: true }
      );
      if (!updatedAssignment) {
        throw new TRPCError({
          message: "Assignment update failed",
          code: "NOT_FOUND",
        });
      }
      return { message: "Assignment updated successfully", updatedAssignment };
    }),
  deleteSubmitWork: privateProcedure
    .input(z.object({ assignmnetId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { user, userId } = ctx;
      await dbConnect();
      const submitWork = await SubmitWork.findOne({
        assignmentObjectId: input.assignmnetId,
        studentObjectId: userId,
      });
      if (submitWork && submitWork.files) {
        const keys = submitWork.files.map((file) => file.key);
        const res = await deleteFilesByKeys(keys);
        console.log("deleted files", res);
      }

      await SubmitWork.deleteOne({
        assignmentObjectId: input.assignmnetId,
        studentObjectId: userId,
      });
      return { message: "Submit work deleted with it's associated files" };
    }),
  deleteAssignment: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx;
      dbConnect();
      const assignment = await Assignment.findOne({
        _id: input.id,
        createdBy: userId,
      });
      if (assignment && assignment.files) {
        const keys = assignment.files.map((file) => file.key);
        const res = await deleteFilesByKeys(keys);
        console.log("deleted files", res);
      }
      await Assignment.deleteOne({ _id: input.id, createdBy: userId });
      return {
        success: true,
        message: "Assignment and associated files deleted",
      };
    }),
  deleteAnnouncement: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx;
      await dbConnect();
      const announcement = await TeacherModuleAnnouncement.findOne({
        _id: input.id,
        createdBy: userId,
      });
      if (announcement && announcement.files) {
        const keys = announcement.files.map((file) => file.key);
        const res = await deleteFilesByKeys(keys);
        console.log("deleted files", res);
      }
      await TeacherModuleAnnouncement.deleteOne({
        _id: input.id,
        createdBy: userId,
      });
      return {
        success: true,
        message: "Announcement and associated files deleted",
      };
    }),
  deleteResource: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx;
      await dbConnect();
      const resource = await TeacherModuleResource.findOne({
        _id: input.id,
        createdBy: userId,
      });
      if (resource && resource.files) {
        const keys = resource.files.map((file) => file.key);
        const res = await deleteFilesByKeys(keys);
        console.log("deleted files", res);
      }
      await TeacherModuleResource.deleteOne({
        _id: input.id,
        createdBy: userId,
      });
      return {
        success: true,
        message: "Resource and associated files deleted",
      };
    }),
  deleteTeacher: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx;
      dbConnect();
      const teacher = await UserModel.findOne({
        _id: input.id,
        createdBy: userId,
      });
      if (teacher && teacher.image) {
        await deleteFile(teacher.image);
      }
      await UserModel.deleteOne({ _id: input.id, createdBy: userId });
      return { success: true, message: "Teacher deleted" };
    }),
  deleteStudent: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx;
      dbConnect();
      const student = await UserModel.findOne({
        _id: input.id,
        createdBy: userId,
      });
      if (student && student.image) {
        await deleteFile(student.image);
      }
      await UserModel.deleteOne({ _id: input.id, createdBy: userId });
      return { success: true, message: "Student deleted" };
    }),
  deleteModule: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx;
      dbConnect();
      await Module.deleteOne({ _id: input.id, createdBy: userId });
      return { success: true, message: "Module deleted" };
    }),
  deleteAssignModule: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx;
      dbConnect();
      await AssignModule.deleteOne({ _id: input.id, createdBy: userId });
      return { success: true, message: "Assign Module deleted" };
    }),
  deleteGroup: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId, user } = ctx;
      dbConnect();
      await Group.deleteOne({ _id: input.id, createdBy: userId });
      return { success: true, message: "Group deleted" };
    }),
});
export type AppRouter = typeof appRouter;
