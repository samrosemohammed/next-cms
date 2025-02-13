import TeacherCreationDialog from "@/components/TeacherCreationDialog";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

const Page = async () => {
  const session = await getServerSession(authOptions);
  console.log(session?.user);
  return (
    <div>
      <div className="flex justify-end px-2 py-4">
        <TeacherCreationDialog />
      </div>
    </div>
  );
};

export default Page;
