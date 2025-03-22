import { AssignmentCreationDialog } from "@/components/AssignmentCreationDialog";
import { GetAssignment } from "@/components/GetAssignment";
import GetAssignmentForStudent from "@/components/GetAssignmentForStudent";
import SelectForSort from "@/components/SelectForSort";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import React from "react";

const Page = async () => {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (user?.role === "teacher") {
    return (
      <div>
        <div className="flex justify-between px-2 py-4">
          <div></div>
          <div className="flex gap-2 items-center">
            <SelectForSort />
            <AssignmentCreationDialog userId={user?.id!} />
          </div>
        </div>
        <GetAssignment />
      </div>
    );
  }
  if (user?.role === "student") {
    return (
      <div>
        <GetAssignmentForStudent userId={user.id!} />
      </div>
    );
  }
  return <div> Page</div>;
};

export default Page;
