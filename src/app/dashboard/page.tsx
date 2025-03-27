import { Dashboard } from "@/components/Dashboard";
import TeacherDashboard from "@/components/TeacherDashboard";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

const Page = async () => {
  const session = await getServerSession(authOptions);
  console.log(session?.user);
  if (session?.user.role === "admin") {
    return <Dashboard />;
  }
  if (session?.user.role === "teacher") {
    return <TeacherDashboard />;
  }
  return <div>Hello from the dashboard</div>;
};

export default Page;
