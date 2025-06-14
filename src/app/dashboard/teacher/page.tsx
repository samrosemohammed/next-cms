import TeacherCreationDialog from "@/components/TeacherCreationDialog";
import { TeacherTable } from "@/components/TeacherTable";

const Page = async () => {
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
