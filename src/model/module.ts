import mongoose, { Schema, Model, Document } from "mongoose";

interface IModule {
  name: string;
  code: string;
  startDate: Date;
  endDate: Date;
  createdBy: {
    id: mongoose.Schema.Types.ObjectId;
    ref: "users";
  };
}

export interface MongoUser extends IModule, Document {}

export type TModule = IModule & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

const ModuleSchema = new Schema<MongoUser>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Module: Model<MongoUser> =
  mongoose.models.Module || mongoose.model<MongoUser>("Module", ModuleSchema);
export default Module;
