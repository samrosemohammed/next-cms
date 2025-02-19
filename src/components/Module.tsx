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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Bookmark, EllipsisVertical, Pencil, Trash } from "lucide-react";
import moduleBanner from "../../public/module-banner.jpg";
import Image from "next/image";
import { Button, buttonVariants } from "./ui/button";
import { useState } from "react";
import { ModuleAssignDialog } from "./ModuleAssignDialog";
import { format } from "date-fns";
import { ModuleCreationDialog } from "./ModuleCreationDialog";

export const Module = () => {
  const [isAssignOpen, setIsAssignOpen] = useState<boolean>(false);
  const [isDeleteAleartOpen, setIsDeleteAleartOpen] = useState<boolean>(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const { data } = trpc.getModules.useQuery();
  const handleDelete = async (moduleId: string) => {
    console.log("module id to delete : ", moduleId);
  };
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
                      setSelectedModuleId(m._id);
                    }}
                  >
                    <Bookmark />
                    Assign
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setIsEditOpen(true);
                      setSelectedModuleId(m._id);
                    }}
                  >
                    <Pencil />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      setIsDeleteAleartOpen(true);
                      setSelectedModuleId(m._id);
                    }}
                  >
                    <Trash />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* <CardContent></CardContent> */}
            <CardFooter className="flex justify-between items-center">
              <p>{format(m.startDate, "yyyy")}</p>
              <p>{format(m.endDate, "yyyy")}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
      <ModuleAssignDialog
        moduleId={selectedModuleId}
        open={isAssignOpen}
        setOpen={setIsAssignOpen}
      />
      <ModuleCreationDialog
        moduleId={selectedModuleId}
        open={isEditOpen}
        setOpen={setIsEditOpen}
      />
      {/* for module delete creation */}
      <AlertDialog
        open={isDeleteAleartOpen}
        onOpenChange={setIsDeleteAleartOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              assign module information and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className={buttonVariants({
                size: "sm",
                variant: "ghost",
              })}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({
                size: "sm",
                variant: "destructive",
              })}
              onClick={() => handleDelete(selectedModuleId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
