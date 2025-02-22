import { FileCreationDialog } from "@/components/FileCreationDialog";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { useParams } from "next/navigation";

const Page = async () => {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <div className="flex justify-end px-2 py-4">
      <FileCreationDialog userId={user?.id!} />
    </div>
  );
};

export default Page;
