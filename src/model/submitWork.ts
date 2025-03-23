import mongoose, { Schema, Model, Document } from "mongoose";
import { TUser } from "./user";
import { TAssignment } from "./assignment";
import { TModule } from "./module";

enum SubmitStatus {
  MISSING = "Missing",
  ONTIME = "On Time",
  LATE = "Late",
}
interface ISubmitWork {
  studentObjectId: TUser | null;
  assignmentObjectId: TAssignment | null;
  moduleObjectId: TModule | null;
  links?: string[];
  files: { name: string; url: string; key: string }[];
  status?: SubmitStatus;
}

export interface MongoUser extends ISubmitWork, Document {}

export type TSubmitWork = ISubmitWork & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

const SubmitWorkSchema = new Schema<MongoUser>(
  {
    studentObjectId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignmentObjectId: {
      type: Schema.Types.ObjectId,
      ref: "assignment",
      required: true,
    },
    moduleObjectId: {
      type: Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    links: [{ type: String }],
    files: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        key: { type: String, required: true },
      },
    ],
    status: {
      type: String,
      enum: ["Missing", "On Time", "Late"],
      default: "Missing",
    },
  },
  {
    timestamps: true,
  }
);

const SubmitWork: Model<MongoUser> =
  mongoose.models.submit_work ||
  mongoose.model<MongoUser>("submit_work", SubmitWorkSchema);
export default SubmitWork;
