import { StudentCreationDialog } from "@/components/StudentCreationDialog";
import { StudentTable } from "@/components/StudentTable";
import React from "react";

const page = () => {
  return (
    <div>
      <div className="flex justify-end px-2 py-4">
        <StudentCreationDialog />
      </div>
      <StudentTable />
    </div>
  );
};

export default page;
