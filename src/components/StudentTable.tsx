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
import { trpc } from "@/app/_trpc/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const StudentTable = () => {
  const utils = trpc.useUtils();
  const { data } = trpc.getStudents.useQuery();
  const deleteStudent = trpc.deleteStudent.useMutation({
    onSuccess: (data) => {
      utils.getStudents.invalidate();
    },
    onError: (err) => {
      console.error("Error deleting student:", err);
    },
  });
  const handleDelete = (id: string) => {
    try {
      deleteStudent.mutate({ id });
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <Table>
      <TableCaption>A list of your recent student created.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[150px]">Student ID</TableHead>
          <TableHead>Student Name</TableHead>
          <TableHead>Student Email</TableHead>
          <TableHead>Student Password</TableHead>
          <TableHead>Student Image</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((s) => (
          <TableRow key={s._id}>
            <TableCell className="font-medium">{s.rollNumber}</TableCell>
            <TableCell>{s.name}</TableCell>
            <TableCell>{s.email}</TableCell>
            <TableCell>{s.password}</TableCell>
            <TableCell>
              <Avatar className="w-8 h-8">
                <AvatarImage src={s.image} alt={`${s.name} profile picture`} />
                <AvatarFallback>{s.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
            </TableCell>
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
                      onClick={() => handleDelete(s._id)}
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
