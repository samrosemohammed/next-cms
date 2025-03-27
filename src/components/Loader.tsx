import { Loader2 } from "lucide-react";

export const Loader = () => {
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <Loader2 className="w-10 h-10 animate-spin text-gray-500" />
    </div>
  );
};
