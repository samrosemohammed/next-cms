import TeacherCreationDialog from "@/components/TeacherCreationDialog";
import { TeacherTable } from "@/components/TeacherTable";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

const Page = async () => {
  const session = await getServerSession(authOptions);
  return (
    <div>
      <div className="flex justify-end px-2 py-4">
        <TeacherCreationDialog />
      </div>
      <TeacherTable />
    </div>
  );
};

export default Page;
