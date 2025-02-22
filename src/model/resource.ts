import mongoose, { Schema, Model, Document } from "mongoose";
import { TModule } from "./module";
import { TUser } from "./user";

interface ITeacherModuleResource {
  title: string;
  description?: string;
  links?: string[];
  files: File[];
  moduleObjectId: TModule | null;
  teacherObjectId: TUser | null;
  createdBy: mongoose.Schema.Types.ObjectId;
}

export interface MongoUser extends ITeacherModuleResource, Document {}

export type TTeacherModuleResource = ITeacherModuleResource & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

const TeacherModuleResourceSchema = new Schema<MongoUser>(
  {
    title: { type: String, required: true },
    description: { type: String },
    links: [{ type: String }],
    files: [{ type: String }],
    moduleObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    teacherObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
const TeacherModuleResource: Model<MongoUser> =
  mongoose.models.teacher_module_resources ||
  mongoose.model<MongoUser>(
    "teacher_module_resources",
    TeacherModuleResourceSchema
  );
export default TeacherModuleResource;
