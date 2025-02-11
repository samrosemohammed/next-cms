import {
  Bookmark,
  ChevronUp,
  Folder,
  Layers2,
  LayoutGrid,
  LogOut,
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

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutGrid,
  },
  {
    title: "Module",
    url: "#",
    icon: Folder,
  },
  {
    title: "Group",
    url: "#",
    icon: Layers2,
  },
  {
    title: "Teacher",
    url: "#",
    icon: UserRound,
  },
  {
    title: "Student",
    url: "#",
    icon: UserRound,
  },
  {
    title: "Assign",
    url: "#",
    icon: Bookmark,
  },
];

const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader className="mb-2">Classroom.</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="">Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {items.map((item) => (
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
                  <User2 /> Username
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <Link href={"#"} className="flex items-center gap-2">
                    <User2 size={16} />
                    <span>Account</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href={"#"} className="flex items-center gap-2">
                    <Wallet size={16} />
                    <span>Billing</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link className="flex items-center gap-2" href={"#"}>
                    <LogOut size={16} />
                    <span>Sign out</span>
                  </Link>
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
