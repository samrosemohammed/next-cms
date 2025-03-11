import { FileCreationDialog } from "@/components/FileCreationDialog";
import { GetResourceFile } from "@/components/GetResourceFile";
import SelectForSort from "@/components/SelectForSort";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

const Page = async () => {
  const session = await getServerSession(authOptions);
  const user = session?.user;

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
};

export default Page;
