"use client";
import { trpc } from "@/app/_trpc/client";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { useParams, usePathname, useRouter } from "next/navigation";

const GetTeacherModule = () => {
  const { data } = trpc.getAssignModuleForTeacher.useQuery();
  const navigate = useRouter();
  console.log(data);
  const uniqueModules = data
    ? Array.from(new Map(data.map((m) => [m?.moduleId?._id, m])).values())
    : [];
  return (
    <div className="grid grid-cols-3 gap-2 mt-4">
      {uniqueModules?.map((m) => (
        <Card
          className="cursor-pointer"
          onClick={() => navigate.push(`/dashboard/module/${m?.moduleId?._id}`)}
          key={m._id}
        >
          {/* <Image
      className="rounded-t rounded-md"
      src={moduleBanner}
      alt="module random image"
    /> */}
          <div className="flex items-center justify-between pr-4">
            <CardHeader>
              <CardTitle>{m.moduleId?.name}</CardTitle>
              <CardDescription>{m.moduleId?.code}</CardDescription>
            </CardHeader>
          </div>

          {/* <CardContent></CardContent> */}
          <CardFooter className="flex justify-between items-center">
            <p>{format(m.moduleId?.startDate!, "yyyy")}</p>
            <p>{format(m.moduleId?.endDate!, "yyyy")}</p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default GetTeacherModule;
