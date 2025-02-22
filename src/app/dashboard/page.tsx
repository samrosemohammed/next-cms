import { Dashboard } from "@/components/Dashboard";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

const Page = async () => {
  const session = await getServerSession(authOptions);
  console.log(session?.user);
  if (session?.user.role === "admin") {
    return <Dashboard />;
  }
  return <div>Hello from the dashboard</div>;
};

export default Page;
