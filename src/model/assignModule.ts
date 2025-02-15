import mongoose, { Schema, Model, Document } from "mongoose";
import { TGroup } from "./group";
import { TUser } from "./user";
import { TModule } from "./module";

interface IAssignModule {
  group: TGroup | null;
  teacher: TUser | null;
  moduleId: TModule | null;
  createdBy: mongoose.Schema.Types.ObjectId;
}

export interface MongoUser extends IAssignModule, Document {}

export type TAssignModule = IAssignModule & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

const AssignModuleSchema = new Schema<MongoUser>(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
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

const AssignModule: Model<MongoUser> =
  mongoose.models.AssignModule ||
  mongoose.model<MongoUser>("AssignModule", AssignModuleSchema);
export default AssignModule;
