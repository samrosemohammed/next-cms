import React from "react";
import { GroupStudent } from "./GroupStudent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const TeacherDashboard = async () => {
  const session = await getServerSession(authOptions);

  return (
    <div className="p-4">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome, {session?.user?.name}
        </h1>
      </div>
      <GroupStudent />
    </div>
  );
};

export default TeacherDashboard;
