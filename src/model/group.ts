import mongoose, { Schema, Model, Document } from "mongoose";

interface IGroup {
  groupName: string;
  groupId: string;
  createdBy: {
    id: mongoose.Schema.Types.ObjectId;
    ref: "users";
  };
}

export interface MongoUser extends IGroup, Document {}

export type TGroup = IGroup & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

const GroupSchema = new Schema<MongoUser>(
  {
    groupName: { type: String, required: true, unique: true },
    groupId: { type: String, required: true, unique: true },
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

const Group: Model<MongoUser> =
  mongoose.models.Group || mongoose.model<MongoUser>("Group", GroupSchema);
export default Group;
