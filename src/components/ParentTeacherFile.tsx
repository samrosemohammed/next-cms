"use client";
import { useState } from "react";
import SelectForSort from "@/components/SelectForSort";
import { FileCreationDialog } from "@/components/FileCreationDialog";
import { GetResourceFile } from "@/components/GetResourceFile";
import { User } from "next-auth";
interface ParentTeacherFileProps {
  user: User;
}
export const ParentTeacherFile = ({ user }: ParentTeacherFileProps) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  return (
    <div>
      <div className="flex justify-between px-2 py-4">
        <div></div>
        <div className="flex gap-2 items-center">
          <SelectForSort onValueChange={setSelectedGroupId} />
          <FileCreationDialog userId={user?.id} />
        </div>
      </div>
      <GetResourceFile selectedGroupId={selectedGroupId} />
    </div>
  );
};
