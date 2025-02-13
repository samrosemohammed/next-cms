"use client";

import { trpc } from "@/app/_trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EllipsisVertical } from "lucide-react";
import moduleBanner from "../../public/module-banner.jpg";
import Image from "next/image";

export const Module = () => {
  const { data } = trpc.getModules.useQuery();
  console.log(data);
  return (
    <div className="grid grid-cols-3 gap-2">
      {data?.map((m) => (
        <Card key={m.code}>
          {/* <Image
            className="rounded-t rounded-md"
            src={moduleBanner}
            alt="module random image"
          /> */}
          <div className="flex items-center justify-between pr-4">
            <CardHeader>
              <CardTitle>{m.name}</CardTitle>
              <CardDescription>{m.code}</CardDescription>
            </CardHeader>
            <EllipsisVertical />
          </div>
          {/* <CardContent></CardContent> */}
          <CardFooter className="flex justify-between items-center">
            <p>{m.startDate}</p>
            <p>{m.endDate}</p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
