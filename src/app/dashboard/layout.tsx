import AppSidebar from "@/components/AppSideBar";
import { DropDownForProfileNav } from "@/components/DropDownForProfileNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { authOptions } from "@/lib/auth";
import { Bell, Moon, Sun, Github } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { PropsWithChildren } from "react";

const Layout = async ({ children }: PropsWithChildren) => {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  return (
    <SidebarProvider>
      <AppSidebar user={user!} />
      <main className="ml-4 flex-1">
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
            {/* <Avatar className="w-8 h-8">
              <AvatarImage
                src={user?.image!}
                alt={`${user?.name} profile picture`}
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar> */}
            <DropDownForProfileNav
              name={user?.name!}
              image={user?.image!}
              email={user?.email!}
            />
          </div>
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
};

export default Layout;
