"use client";

import { trpc } from "@/app/_trpc/client";
import { Button } from "@/components/ui/button";
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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";
import { useState } from "react";
import TeacherCreationDialog from "./TeacherCreationDialog";
import { TeacherFormData } from "@/lib/validator/zodValidation";
import { Empty } from "./Empty";
import { Loader } from "./Loader";
import { Card, CardDescription, CardFooter, CardHeader } from "./ui/card";

export const TeacherTable = () => {
  const utils = trpc.useUtils();
  const [isEditTeacherOpen, setIsEditTeacherOpen] = useState<boolean>(false);
  const [selectedTeacherInfo, setSelectedTeacherInfo] =
    useState<TeacherFormData>();
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const { data, isLoading: isTeacherLoading } = trpc.getTeachers.useQuery();
  const deleteTeacher = trpc.deleteTeacher.useMutation({
    onSuccess: (data) => {
      utils.getTeachers.invalidate();
      toast.success(data.message);
    },
    onError: (err) => {
      console.error("Error deleting teacher:", err);
      if (err instanceof TRPCClientError) {
        toast.error(err.message);
      }
    },
  });
  const handleDelete = (id: string) => {
    try {
      deleteTeacher.mutate({ id });
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div>
      {isTeacherLoading ? (
        <Loader />
      ) : data?.length ? (
        <>
          {/* 🚀 Mobile: Card Layout */}
          <div className="md:hidden space-y-4 py-2 px-4">
            {data.map((t) => (
              <Card key={t._id} className="p-4">
                <CardHeader>
                  <CardDescription className="flex items-center gap-4">
                    <Avatar className="">
                      <AvatarImage src={t.image} />
                      <AvatarFallback>{t.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                      <p className="text-lg font-medium">{t.name}</p>
                      <p>{t.email}</p>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-end items-center gap-2">
                  <Button
                    onClick={() => {
                      setSelectedTeacherId(t._id);
                      setSelectedTeacherInfo({
                        teacherEmail: t.email,
                        teacherId: t.rollNumber!,
                        teacherImage: t.image,
                        teacherName: t.name,
                        teacherPassword: t.password,
                      });
                      setIsEditTeacherOpen(true);
                    }}
                    size="sm"
                    variant="edit"
                  >
                    Edit
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
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
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(t._id)}
                          className="bg-red-600 hover:bg-red-700"
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
          {/* 💻 Desktop: Table View */}
          <div className="hidden md:block w-full overflow-x-auto">
            <Table>
              <TableCaption>A list of your recent group created.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">SN</TableHead>
                  <TableHead>Teacher Name</TableHead>
                  <TableHead>Teacher Email</TableHead>
                  <TableHead>Teacher Password</TableHead>
                  <TableHead>Teacher Image</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((t, i) => (
                  <TableRow key={t._id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{t.name}</TableCell>
                    <TableCell>{t.email}</TableCell>
                    <TableCell>{t.password}</TableCell>
                    <TableCell>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={t.image} />
                        <AvatarFallback>{t.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        onClick={() => {
                          setSelectedTeacherId(t._id);
                          setSelectedTeacherInfo({
                            teacherEmail: t.email,
                            teacherId: t.rollNumber!,
                            teacherImage: t.image,
                            teacherName: t.name,
                            teacherPassword: t.password,
                          });
                          setIsEditTeacherOpen(true);
                        }}
                        size="sm"
                        variant="edit"
                      >
                        Edit
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
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
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(t._id)}
                              className="bg-red-600 hover:bg-red-700"
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
        <Empty des="No teacher found. Please enroll a teacher." />
      )}

      {isEditTeacherOpen && (
        <TeacherCreationDialog
          teacherInfo={selectedTeacherInfo}
          teacherId={selectedTeacherId}
          openFromEdit={isEditTeacherOpen}
          setOpenFromEdit={setIsEditTeacherOpen}
        />
      )}
    </div>
  );
};
