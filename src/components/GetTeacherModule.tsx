"use client";
import { trpc } from "@/app/_trpc/client";
import moduleBanner from "../../public/module-banner.jpg";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import Image from "next/image";
import { useParams, usePathname, useRouter } from "next/navigation";
import { FolderOpen, Loader2 } from "lucide-react";
import { Empty } from "./Empty";
import { Loader } from "./Loader";

const GetTeacherModule = () => {
  const { data, isLoading: isModuleLoading } =
    trpc.getAssignModuleForTeacher.useQuery();
  const navigate = useRouter();
  console.log(data);
  const uniqueModules = data
    ? Array.from(new Map(data.map((m) => [m?.moduleId?._id, m])).values())
    : [];
  return (
    <div>
      {isModuleLoading ? (
        <Loader />
      ) : data?.length ? (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {uniqueModules?.map((m) => (
            <Card
              className="cursor-pointer hover:shadow-lg hover:translate-y-0.5 transition-transform"
              onClick={() =>
                navigate.push(`/dashboard/module/${m?.moduleId?._id}/files`)
              }
              key={m._id}
            >
              <Image
                className="rounded-t rounded-md"
                src={moduleBanner}
                alt="module random image"
              />
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
      ) : (
        <Empty des="No module assigned currently. Please check back later." />
      )}
    </div>
  );
};

export default GetTeacherModule;
