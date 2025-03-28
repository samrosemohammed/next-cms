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
const GetModuleForStudent = () => {
  const { data: studentGroupModule } =
    trpc.getAssignModuleForStudent.useQuery();
  const navigate = useRouter();
  console.log(studentGroupModule);
  return (
    <div className="grid grid-cols-3 gap-4 mt-4">
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
            <p>{format(m.moduleId?.startDate!, "yyyy")}</p>
            <p>{format(m.moduleId?.endDate!, "yyyy")}</p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default GetModuleForStudent;
