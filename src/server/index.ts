import { z, ZodError } from "zod";
import { privateProcedure, publicProcedure, router } from "./trpc";
import {
  announcementSchema,
  assignmentSchema,
  assignModuleSchema,
  moduleSchema,
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
export const appRouter = router({
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
      await assignment.save();
      return { assignment, message: "Assignment created" };
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
      return { tmr, message: "Resource created" };
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
