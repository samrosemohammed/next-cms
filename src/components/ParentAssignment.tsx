"use client";
import { User } from "next-auth";
import { AssignmentCreationDialog } from "./AssignmentCreationDialog";
import { GetAssignment } from "./GetAssignment";
import SelectForSort from "./SelectForSort";
import { useState } from "react";

interface ParentAssignmentProps {
  user: User;
}
export const ParentAssignment = ({ user }: ParentAssignmentProps) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  return (
    <div>
      <div className="flex justify-between px-2 py-4">
        <div></div>
        <div className="flex gap-2 items-center">
          <SelectForSort onValueChange={setSelectedGroupId} />
          <AssignmentCreationDialog userId={user?.id ?? ""} />
        </div>
      </div>
      <GetAssignment selectedGroupId={selectedGroupId} />
    </div>
  );
};
