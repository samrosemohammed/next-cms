import mongoose, { Schema, Model, Document } from "mongoose";
import { TModule } from "./module";
import { TUser } from "./user";
import { TGroup } from "./group";

interface ITeacherModuleResource {
  title: string;
  description?: string;
  links?: string[];
  files: { name: string; url: string; key: string }[]; // Fix here
  moduleObjectId: TModule | null;
  teacherObjectId: TUser | null;
  groupObjectId: TGroup | null;
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
    files: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        key: { type: String, required: true },
      },
    ],
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
    groupObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
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
