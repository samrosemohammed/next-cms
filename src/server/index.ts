import { z } from "zod";
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
import mongoose from "mongoose";
import AssignModule from "@/model/assignModule";

export const appRouter = router({
  createAssignModule: privateProcedure
    .input(assignModuleSchema)
    .mutation(async ({ input, ctx }) => {
      const { user, userId } = ctx;
      dbConnect();
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
      console.log(user, userId);
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
      console.log("create : ", userId);
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
    console.log("getTeacher", user, ctx);
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
  deleteTeacher: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx;
      dbConnect();
      await UserModel.deleteOne({ _id: input.id, createdBy: userId });
      return { success: true, message: "Teacher deleted" };
    }),
  deleteStudent: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx;
      dbConnect();
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
});
export type AppRouter = typeof appRouter;
