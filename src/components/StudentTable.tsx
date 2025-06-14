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
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";
import { useState } from "react";
import { StudentFormData } from "@/lib/validator/zodValidation";
import { StudentCreationDialog } from "./StudentCreationDialog";
import { Loader } from "./Loader";
import { Empty } from "./Empty";

export const StudentTable = () => {
  const utils = trpc.useUtils();
  const [isEditStudentOpen, setIsEditStudentOpen] = useState<boolean>(false);
  const [selectedStudentInfo, setSelectedStudentInfo] =
    useState<StudentFormData>();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const { data, isLoading: isStudentLoading } = trpc.getStudents.useQuery();
  const deleteStudent = trpc.deleteStudent.useMutation({
    onSuccess: (data) => {
      utils.getStudents.invalidate();
      toast.success(data.message);
    },
    onError: (err) => {
      console.error("Error deleting student:", err);
      if (err instanceof TRPCClientError) {
        toast.error(err.message);
      }
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
    <div>
      {isStudentLoading ? (
        <Loader />
      ) : data?.length ? (
        <Table>
          <TableCaption>A list of your recent student created.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">SN</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Student Email</TableHead>
              <TableHead>Student Password</TableHead>
              <TableHead>Student Group</TableHead>
              <TableHead>Student Image</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((s, i) => (
              <TableRow key={s._id}>
                <TableCell className="font-medium">{i + 1}</TableCell>
                {/* <TableCell className="font-medium">{s.rollNumber}</TableCell> */}
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell>{s.password}</TableCell>
                <TableCell>{s.group?.groupName ?? "N/A"}</TableCell>
                <TableCell>
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={s.image}
                      alt={`${s.name} profile picture`}
                    />
                    <AvatarFallback>{s.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    className={buttonVariants({
                      size: "sm",
                      variant: "edit",
                    })}
                    onClick={() => {
                      setSelectedStudentId(s._id);
                      setSelectedStudentInfo({
                        studentEmail: s.email,
                        studentName: s.name,
                        studentGroup: s.group?.groupName ?? "N/A",
                        studentImage: s.image,
                        studentId: s.rollNumber!,
                        studentPassword: s.password,
                      });
                      setIsEditStudentOpen(true);
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
      ) : (
        <Empty des="No student found. Please enroll a student." />
      )}

      {isEditStudentOpen && (
        <StudentCreationDialog
          studentInfo={selectedStudentInfo}
          studentId={selectedStudentId}
          openFromEdit={isEditStudentOpen}
          setOpenFromEdit={setIsEditStudentOpen}
        />
      )}
    </div>
  );
};
