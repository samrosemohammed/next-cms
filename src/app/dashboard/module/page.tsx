import GetModuleForStudent from "@/components/GetModuleForStudent";
import GetTeacherModule from "@/components/GetTeacherModule";
import { Module } from "@/components/Module";
import { ModuleCreationDialog } from "@/components/ModuleCreationDialog";
import { authOptions } from "@/lib/auth";

import { getServerSession } from "next-auth";

const Page = async () => {
  const session = await getServerSession(authOptions);

  if (session?.user.role === "admin") {
    return (
      <div>
        <div className="flex justify-end px-2 py-4">
          <ModuleCreationDialog />
        </div>

        <div className="px-2">
          <Module />
        </div>
      </div>
    );
  }
  if (session?.user.role === "teacher") {
    return (
      <div>
        <div className="px-2">
          <GetTeacherModule />
        </div>
      </div>
    );
  }
  if (session?.user.role === "student") {
    return (
      <div>
        <div className="px-2">
          <GetModuleForStudent />
        </div>
      </div>
    );
  }
  return <div>Page</div>;
};

export default Page;
