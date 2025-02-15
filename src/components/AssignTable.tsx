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
export const AssignTable = () => {
  const utils = trpc.useUtils();
  const { data } = trpc.getAssignModules.useQuery();
  const deleteAssignModule = trpc.deleteAssignModule.useMutation({
    onSuccess: (data) => {
      console.log("data", data);
      utils.getAssignModules.invalidate();
    },
    onError: (error) => {
      console.log("error", error);
    },
  });
  const handleDelete = (assignId: string) => {
    try {
      deleteAssignModule.mutate({ id: assignId });
    } catch (err) {
      console.log(err);
    }
  };
  return (
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
                      This action cannot be undone. This will permanently delete
                      your teacher information and remove your data from our
                      servers.
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
  );
};
