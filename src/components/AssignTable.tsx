"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Button, buttonVariants } from "./ui/button";
import { trpc } from "@/app/_trpc/client";
import { useState } from "react";
import { ModuleAssignDialog } from "./ModuleAssignDialog";
import { AssignModuleFormData } from "@/lib/validator/zodValidation";
import { Loader } from "./Loader";
import { Empty } from "./Empty";
import { toast } from "sonner";
import { Card, CardDescription, CardFooter, CardHeader } from "./ui/card";
export const AssignTable = () => {
  const utils = trpc.useUtils();
  const { data, isLoading: isAssignModuleLoading } =
    trpc.getAssignModules.useQuery();
  const [isEditAssigOpen, setIsAssignOpen] = useState<boolean>(false);
  const [selectAssignModuleId, setSelectedAssignModuleId] =
    useState<string>("");
  const [selectedAssignModule, setSelectedAssignModule] =
    useState<AssignModuleFormData>();
  const deleteAssignModule = trpc.deleteAssignModule.useMutation({
    onSuccess: () => {
      utils.getAssignModules.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const handleDelete = (assignId: string) => {
    try {
      deleteAssignModule.mutate({ id: assignId });
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unknown error occurred.");
      }
    }
  };
  return (
    <div>
      {isAssignModuleLoading ? (
        <Loader />
      ) : data?.length ? (
        <>
          <div className="md:hidden space-y-4 py-2 px-2 sm:px-4">
            {data.map((am) => (
              <Card key={am._id} className="p-4">
                <CardHeader>
                  <CardDescription className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-lg font-medium">{am.moduleId?.name}</p>
                      <p>Assigned Teacher: {am.teacher?.name}</p>
                      <p>Group Name: {am.group?.groupName}</p>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-end items-center gap-2">
                  <Button
                    className={buttonVariants({
                      size: "sm",
                      variant: "edit",
                    })}
                    onClick={() => {
                      setSelectedAssignModule({
                        teacher: am.teacher?._id ?? "",
                        group: am.group?._id ?? "",
                        moduleId: am.moduleId?._id ?? "",
                      });
                      setSelectedAssignModuleId(am._id ?? "");
                      setIsAssignOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size={"sm"}
                        variant={"destructive"}
                        className="outline-none"
                      >
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your teacher information and remove your data
                          from our servers.
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
                          onClick={() => handleDelete(am._id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="hidden md:block w-full overflow-x-auto">
            <Table>
              <TableCaption>A list of your recent assign module.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Module Name</TableHead>
                  <TableHead>Assign Teacher</TableHead>
                  <TableHead>Assign Group</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((am) => (
                  <TableRow key={am._id}>
                    <TableCell className="font-medium">
                      {am.moduleId?.name ?? "N/A"}
                    </TableCell>
                    <TableCell>{am.teacher?.name ?? "N/A"}</TableCell>
                    <TableCell>{am.group?.groupName ?? "N/A"}</TableCell>

                    <TableCell className="text-right space-x-2">
                      <Button
                        className={buttonVariants({
                          size: "sm",
                          variant: "edit",
                        })}
                        onClick={() => {
                          setSelectedAssignModule({
                            teacher: am.teacher?._id ?? "",
                            group: am.group?._id ?? "",
                            moduleId: am.moduleId?._id ?? "",
                          });
                          setSelectedAssignModuleId(am._id ?? "");
                          setIsAssignOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size={"sm"}
                            variant={"destructive"}
                            className="outline-none"
                          >
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete your teacher information and
                              remove your data from our servers.
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
                              onClick={() => handleDelete(am._id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <Empty des="No assign module found. Please assign a module to group and teacher." />
      )}

      {isEditAssigOpen && (
        <ModuleAssignDialog
          assignModuleId={selectAssignModuleId}
          open={isEditAssigOpen}
          setOpen={setIsAssignOpen}
          assignModuleInfo={selectedAssignModule}
        />
      )}
    </div>
  );
};
