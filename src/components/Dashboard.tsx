import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { OverviewSection } from "./OverviewSection";

export const Dashboard = async () => {
  const session = await getServerSession(authOptions);
  return (
    <div className="p-4">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome, {session?.user?.name}
        </h1>
      </div>
      <OverviewSection />
    </div>
  );
};
