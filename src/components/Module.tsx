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
import {
  Bookmark,
  EllipsisVertical,
  FolderOpen,
  Loader2,
  Pencil,
  Trash,
} from "lucide-react";
import moduleBanner from "../../public/module-banner.jpg";
import Image from "next/image";
import { Button, buttonVariants } from "./ui/button";
import { useState } from "react";
import { ModuleAssignDialog } from "./ModuleAssignDialog";
import { format } from "date-fns";
import { ModuleCreationDialog } from "./ModuleCreationDialog";
import { ModuleFormData } from "@/lib/validator/zodValidation";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";
import { Loader } from "./Loader";
import { Empty } from "./Empty";

export const Module = () => {
  const utils = trpc.useUtils();
  const [isAssignOpen, setIsAssignOpen] = useState<boolean>(false);
  const [isDeleteAleartOpen, setIsDeleteAleartOpen] = useState<boolean>(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [selectedModuleInfo, setSelectedModuleInfo] =
    useState<ModuleFormData>();
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const { data, isLoading: isModuleLoading } = trpc.getModules.useQuery();
  const deleteModule = trpc.deleteModule.useMutation({
    onSuccess: (data) => {
      utils.getModules.invalidate();
      setIsDeleteAleartOpen(false);
      toast.success(data.message);
    },
    onError: (error) => {
      console.log("error: ", error.message);
      if (error instanceof TRPCClientError) {
        toast.error(error.message);
      }
    },
  });

  const handleDelete = async (moduleId: string) => {
    deleteModule.mutateAsync({ id: moduleId });
  };
  return (
    <div>
      {isModuleLoading ? (
        <Loader />
      ) : data?.length ? (
        <div className="grid grid-cols-3 gap-4">
          {data?.map((m) => (
            <Card key={m.code}>
              <Image
                className="rounded-t rounded-md"
                src={moduleBanner}
                alt="module random image"
              />
              <div className="flex items-center justify-between pr-4">
                <CardHeader>
                  <CardTitle>{m.name}</CardTitle>
                  <CardDescription>{m.code}</CardDescription>
                </CardHeader>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="cursor-pointer hover:bg-gray-200/80 rounded-full p-2">
                      <EllipsisVertical className="w-5 h-5" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="left">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        setIsAssignOpen(true);
                        setSelectedModuleId(m._id);
                      }}
                    >
                      <Bookmark />
                      Assign
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        setIsEditOpen(true);
                        setSelectedModuleId(m._id);
                        setSelectedModuleInfo({
                          ...m,
                          startDate: new Date(m.startDate),
                          endDate: new Date(m.endDate),
                        });
                      }}
                    >
                      <Pencil />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
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
      ) : (
        <Empty des="No module found. Please create a new module." />
      )}

      <ModuleAssignDialog
        moduleId={selectedModuleId}
        open={isAssignOpen}
        setOpen={setIsAssignOpen}
      />
      {isEditOpen && (
        <ModuleCreationDialog
          moduleInfo={selectedModuleInfo}
          moduleId={selectedModuleId}
          openFromEdit={isEditOpen}
          setOpenFromEdit={setIsEditOpen}
        />
      )}
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
