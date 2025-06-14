"use client";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import Image from "next/image";
import moduleBanner from "../../public/module-banner.jpg";
import { Loader } from "./Loader";
import { Empty } from "./Empty";
const GetModuleForStudent = () => {
  const { data: studentGroupModule, isLoading: isModuleLoading } =
    trpc.getAssignModuleForStudent.useQuery();
  const navigate = useRouter();
  return (
    <div>
      {isModuleLoading ? (
        <Loader />
      ) : studentGroupModule?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {studentGroupModule?.map((m) => (
            <Card
              className="cursor-pointer hover:shadow-lg hover:translate-y-0.5 transition-transform"
              onClick={() =>
                navigate.push(`/dashboard/module/${m?.moduleId?._id}/files`)
              }
              key={m?.moduleId?._id}
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
                <p>{format(m.moduleId?.startDate ?? "", "yyyy")}</p>
                <p>{format(m.moduleId?.endDate ?? "", "yyyy")}</p>
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

export default GetModuleForStudent;
