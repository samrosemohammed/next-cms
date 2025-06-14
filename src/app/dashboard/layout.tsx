import AppSidebar from "@/components/AppSideBar";
import { DropDownForProfileNav } from "@/components/DropDownForProfileNav";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { authOptions } from "@/lib/auth";
import { Bell, Github } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { PropsWithChildren } from "react";
const Layout = async ({ children }: PropsWithChildren) => {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!user) {
    throw new Error("User must be authenticated to access this layout.");
  }
  return (
    <SidebarProvider>
      <AppSidebar user={user!} />
      <main className="md:ml-4 flex-1">
        <div className="flex items-center justify-between p-2 border-b">
          <SidebarTrigger />
          <div className="flex items-center justify-center gap-6">
            <Bell size={20} />
            <Link
              target="_blank"
              className="cursor-pointer hover:bg-muted"
              href={"https://github.com/samrosemohammed/next-cms"}
            >
              <Github size={20} />
            </Link>
            <DropDownForProfileNav
              name={user.name ?? "Guest"}
              image={user.image ?? ""}
              email={user?.email ?? "guest@gmail.com"}
            />
          </div>
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
};

export default Layout;
