import mongoose, { Schema, Model, Document } from "mongoose";
import { TModule } from "./module";
import { TUser } from "./user";
import { TGroup } from "./group";

interface IAssignment {
  title: string;
  description?: string;
  links?: string[];
  files: { name: string; url: string; key: string }[];
  moduleObjectId: TModule | null;
  teacherObjectId: TUser | null;
  groupObjectId: TGroup | null;
  dueDate: Date;
  createdBy: mongoose.Schema.Types.ObjectId;
}

export interface MongoUser extends IAssignment, Document {}

export type TAssignment = IAssignment & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

const AssignmentSchema = new Schema<MongoUser>(
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
    dueDate: { type: Date, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Assignment: Model<MongoUser> =
  mongoose.models.assignment ||
  mongoose.model<MongoUser>("assignment", AssignmentSchema);
export default Assignment;
