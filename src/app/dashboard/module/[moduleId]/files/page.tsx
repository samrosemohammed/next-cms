import { FileCreationDialog } from "@/components/FileCreationDialog";
import { GetResourceFile } from "@/components/GetResourceFile";
import GetResourceForStudent from "@/components/GetResourceForStudent";
import SelectForSort from "@/components/SelectForSort";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

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
            <FileCreationDialog userId={user?.id!} />
          </div>
        </div>
        <GetResourceFile />
      </div>
    );
  }
  if (user?.role === "student") {
    return (
      <div>
        <GetResourceForStudent />
      </div>
    );
  }
  return <div>Page</div>;
};

export default Page;
