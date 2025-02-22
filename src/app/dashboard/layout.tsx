import AppSidebar from "@/components/AppSideBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { authOptions } from "@/lib/auth";
import { Bell, Moon, Sun, Github } from "lucide-react";
import { getServerSession } from "next-auth";
import { PropsWithChildren } from "react";

const Layout = async ({ children }: PropsWithChildren) => {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  console.log(user);
  return (
    <SidebarProvider>
      <AppSidebar user={user!} />
      <main className="ml-4 flex-1">
        <div className="flex items-center justify-between p-2 border-b">
          <SidebarTrigger />
          <div className="flex items-center justify-center gap-6">
            <Bell size={20} />
            <Github size={20} />
            <Avatar className="w-8 h-8">
              <AvatarImage
                src="https://github.com/shadcn.png"
                alt="@classroom"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
};

export default Layout;
