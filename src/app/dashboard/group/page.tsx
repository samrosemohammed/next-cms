import GroupCreationDialog from "@/components/GroupCreationDialog";
import { GroupTable } from "@/components/GroupTable";

const Group = () => {
  return (
    <div>
      <div className="flex justify-end px-2 py-4">
        <GroupCreationDialog />
      </div>
      <GroupTable />
    </div>
  );
};

export default Group;
