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

        <div>
          <Module />
        </div>
      </div>
    );
  }
  return <div>Page</div>;
};

export default Page;
