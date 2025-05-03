import { Database } from "lucide-react";

interface EmptyProps {
  des?: string;
}
export const Empty = ({ des }: EmptyProps) => {
  return (
    <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
      <Database className="w-10 h-10 text-muted-foreground" />
      <p className="text-muted-foreground text-sm flex justify-center items-center">
        {des}
      </p>
    </div>
  );
};
