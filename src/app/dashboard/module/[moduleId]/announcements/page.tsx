import { AnnouncementCreationDialog } from "@/components/AnnouncementCreationDialog";
import { GetAnnouncement } from "@/components/GetAnnouncement";
import { GetAnnouncementForStudent } from "@/components/GetAnnouncementForStudent";
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
            <AnnouncementCreationDialog userId={user?.id!} />
          </div>
        </div>
        <GetAnnouncement />
      </div>
    );
  }
  if (user?.role === "student") {
    return (
      <div>
        <GetAnnouncementForStudent userId={user?.id!} />
      </div>
    );
  }
  return <div>Page</div>;
};

export default Page;
