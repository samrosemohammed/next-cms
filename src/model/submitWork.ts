import mongoose, { Schema, Model, Document } from "mongoose";

interface ISubmitWork {
  studentObjectId: string;
  assignmentObjectId: string;
  moduleObjectId: string;
  links?: string[];
  files: { name: string; url: string; key: string }[];
}

export interface MongoUser extends ISubmitWork, Document {}

export type TSubmitWork = ISubmitWork & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

const SubmitWorkSchema = new Schema<MongoUser>(
  {
    studentObjectId: { type: String, required: true },
    assignmentObjectId: { type: String, required: true },
    moduleObjectId: { type: String, required: true },
    links: [{ type: String }],
    files: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        key: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const SubmitWork: Model<MongoUser> =
  mongoose.models.submit_work ||
  mongoose.model<MongoUser>("submit_work", SubmitWorkSchema);
export default SubmitWork;
