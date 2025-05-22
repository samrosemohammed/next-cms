import GetResourceForStudent from "@/components/GetResourceForStudent";
import { ParentTeacherFile } from "@/components/ParentTeacherFile";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

const Page = async () => {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (user?.role === "teacher") {
    return <ParentTeacherFile user={user} />;
  }
  if (user?.role === "student") {
    return (
      <div>
        <GetResourceForStudent />
      </div>
    );
  }
  return <div>Page</div>;
};

export default Page;
