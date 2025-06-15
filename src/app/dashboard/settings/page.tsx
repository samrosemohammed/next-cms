import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, User } from "lucide-react";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProfileInformationTabs } from "@/components/ProfileInformationTabs";
import { SecurityTabs } from "@/components/SecurityTabs";

const Pages = async () => {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  return (
    <div className="container mx-auto py-4 space-y-8 sm:pl-0 pl-4">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and set email preferences.
        </p>
      </div>
      <Separator className="my-4" />
      <Tabs defaultValue="profile" className="w-full pr-2">
        <TabsList className="grid max-w-md grid-cols-2 lg:w-auto">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>
        <ProfileInformationTabs user={user!} />
        <SecurityTabs />
      </Tabs>
    </div>
  );
};
export default Pages;
