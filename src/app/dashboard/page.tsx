import { Dashboard } from "@/components/Dashboard";
import { StudentDashboard } from "@/components/StudentDashboard";
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
  if (session?.user.role === "student") {
    return <StudentDashboard />;
  }
  return <div>Hello from the dashboard</div>;
};

export default Page;
