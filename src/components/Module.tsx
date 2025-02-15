"use client";
import { trpc } from "@/app/_trpc/client";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Bookmark, EllipsisVertical, Pencil, Trash } from "lucide-react";
import moduleBanner from "../../public/module-banner.jpg";
import Image from "next/image";
import { Button } from "./ui/button";
import { useState } from "react";
import { ModuleAssignDialog } from "./ModuleAssignDialog";

export const Module = () => {
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const { data } = trpc.getModules.useQuery();
  console.log(data);
  return (
    <div>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <EllipsisVertical />
                </DropdownMenuTrigger>
                <DropdownMenuContent side="left">
                  <DropdownMenuItem
                    onClick={() => {
                      setIsAssignOpen(true);
                    }}
                  >
                    <Bookmark />
                    Assign
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Pencil />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Trash />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {/* <CardContent></CardContent> */}
            <CardFooter className="flex justify-between items-center">
              <p>{m.startDate}</p>
              <p>{m.endDate}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
      <ModuleAssignDialog open={isAssignOpen} setOpen={setIsAssignOpen} />
    </div>
  );
};
