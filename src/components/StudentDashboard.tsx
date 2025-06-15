import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { SummaryOfStudent } from "./SummaryOfStudent";

export const StudentDashboard = async () => {
  const session = await getServerSession(authOptions);

  return (
    <div className="px-2 py-4 sm:p-4">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome, {session?.user?.name}
        </h1>
      </div>
      <SummaryOfStudent />
    </div>
  );
};
