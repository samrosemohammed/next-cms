import mongoose, { Model, Schema } from "mongoose";

enum Role {
  ADMIN = "admin",
  TEACHER = "teacher",
  USER = "user",
}
interface IUser {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface MongoUser extends IUser, Document {}

export type TUser = IUser & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

const UserSchema = new Schema<MongoUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const UserModel: Model<MongoUser> =
  mongoose.models.User || mongoose.model<MongoUser>("User", UserSchema);
export default UserModel;
