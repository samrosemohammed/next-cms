import { AssignmentCreationDialog } from "@/components/AssignmentCreationDialog";
import { GetAssignment } from "@/components/GetAssignment";
import GetAssignmentForStudent from "@/components/GetAssignmentForStudent";
import { ParentAssignment } from "@/components/ParentAssignment";
import SelectForSort from "@/components/SelectForSort";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import React from "react";

const Page = async () => {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (user?.role === "teacher") {
    return <ParentAssignment user={user} />;
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
