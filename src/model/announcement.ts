import mongoose, { Schema, Model, Document } from "mongoose";
import { TModule } from "./module";
import { TUser } from "./user";
import { TGroup } from "./group";

interface ITeacherModuleAnnouncement {
  description: string;
  links?: string[];
  files: { name: string; url: string; key: string }[]; // Fix here
  moduleObjectId: TModule | null;
  teacherObjectId: TUser | null;
  groupObjectId: TGroup | null;
  createdBy: mongoose.Schema.Types.ObjectId;
}

export interface MongoUser extends ITeacherModuleAnnouncement, Document {}

export type TTeacherModuleAnnouncement = ITeacherModuleAnnouncement & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

const TeacherModuleAnnouncementSchema = new Schema<MongoUser>(
  {
    description: { type: String, required: true },
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

const TeacherModuleAnnouncement: Model<MongoUser> =
  mongoose.models.teacher_module_announcements ||
  mongoose.model(
    "teacher_module_announcements",
    TeacherModuleAnnouncementSchema
  );

export default TeacherModuleAnnouncement;
