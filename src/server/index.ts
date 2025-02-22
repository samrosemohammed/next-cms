import { z, ZodError } from "zod";
import { privateProcedure, publicProcedure, router } from "./trpc";
import {
  assignModuleSchema,
  moduleSchema,
  studentSchema,
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
import mongoose from "mongoose";

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
export const appRouter = router({
  createAssignModule: privateProcedure
    .input(assignModuleSchema)
    .mutation(async ({ input, ctx }) => {
      const { user, userId } = ctx;
      dbConnect();

      const existTeacherGroupAssign = await AssignModule.findOne({
        group: input.group,
        teacher: input.teacher,
        createdBy: userId,
      });
      if (existTeacherGroupAssign) {
        throw new TRPCError({
          message: "Teacher already assigned to this group",
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
