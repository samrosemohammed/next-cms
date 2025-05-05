import mongoose, { Model, Schema } from "mongoose";
import { TGroup } from "./group";

enum Role {
  ADMIN = "admin",
  TEACHER = "teacher",
  USER = "user",
}
interface IUser {
  name: string;
  email: string;
  username?: string;
  password: string;
  image: string;
  bio?: string;
  role: Role;
  rollNumber?: string;
  group: TGroup | null;
  createdBy?: mongoose.Schema.Types.ObjectId;
}

export interface MongoUser extends IUser, Document {}

export type TUser = IUser & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

const UserSchema = new Schema<MongoUser>(
  {
    username: { type: String },
    bio: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    image: { type: String },
    role: { type: String, required: true },
    rollNumber: { type: String, required: false },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    }, // Add the reference here
  },
  {
    timestamps: true,
  }
);
const UserModel: Model<MongoUser> =
  mongoose.models.User || mongoose.model<MongoUser>("User", UserSchema);
export default UserModel;
