"use client";
import {
  Bookmark,
  ChevronLeft,
  ChevronUp,
  File,
  Folder,
  Layers2,
  LayoutGrid,
  LogOut,
  MessageSquare,
  User2,
  UserRound,
  Wallet,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { User } from "next-auth";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { signOut } from "next-auth/react";

interface AppSidebarProps {
  user: User;
}
const AppSidebar = ({ user }: AppSidebarProps) => {
  const pathname = usePathname();
  const isModulePage = /^\/dashboard\/module\/[^/]+(\/.*)?$/.test(
    pathname ?? ""
  );
  const items = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutGrid,
    },
    {
      title: "Module",
      url: "/dashboard/module",
      icon: Folder,
    },
    {
      title: "Group",
      url: "/dashboard/group",
      icon: Layers2,
    },
    {
      title: "Teacher",
      url: "/dashboard/teacher",
      icon: UserRound,
    },
    {
      title: "Student",
      url: "/dashboard/student",
      icon: UserRound,
    },
    {
      title: "Assign",
      url: "/dashboard/assign",
      icon: Bookmark,
    },
  ];

  const moduleItems = [
    { title: "Back", url: "/dashboard/module", icon: ChevronLeft },
    { title: "Files", url: `${pathname}/files`, icon: File },
    { title: "Assignments", url: `${pathname}/assignments`, icon: Bookmark },
    {
      title: "Announcements",
      url: `${pathname}/announcements`,
      icon: MessageSquare,
    },
  ];
  const filteredItems =
    user?.role === "teacher"
      ? items.filter(
          (item) => item.title === "Dashboard" || item.title === "Module"
        )
      : items;

  const handleLogOut = () => {
    signOut({
      callbackUrl: "/login",
    });
  };
  return (
    <Sidebar>
      <SidebarHeader className="mb-2">Classroom.</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="">Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {(isModulePage ? moduleItems : filteredItems).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  {user.image ? (
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={user.image} alt="@classroom" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  ) : (
                    <User2 />
                  )}{" "}
                  {user ? user.name : "Username"}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem className="cursor-pointer">
                  <Link href={"#"} className="flex items-center gap-2">
                    <User2 size={16} />
                    <span>Account</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Link href={"#"} className="flex items-center gap-2">
                    <Wallet size={16} />
                    <span>Billing</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <div
                    onClick={handleLogOut}
                    className="flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    <span>Sign out</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
export default AppSidebar;
