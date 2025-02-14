"use client";

import { trpc } from "@/app/_trpc/client";
import { Button, buttonVariants } from "@/components/ui/button";
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

export const TeacherTable = () => {
  const utils = trpc.useUtils();
  const { data } = trpc.getTeachers.useQuery();
  const deleteTeacher = trpc.deleteTeacher.useMutation({
    onSuccess: (data) => {
      utils.getTeachers.invalidate();
    },
    onError: (err) => {
      console.error("Error deleting teacher:", err);
    },
  });
  const handleDelete = (id: string) => {
    try {
      deleteTeacher.mutate({ id });
    } catch (err) {
      console.log(err);
    }
  };
  console.log(data);
  return (
    <Table>
      <TableCaption>A list of your recent group created.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[150px]">Teacher ID</TableHead>
          <TableHead>Teacher Name</TableHead>
          <TableHead>Teacher Email</TableHead>
          <TableHead>Teacher Password</TableHead>
          <TableHead>Teacher Image</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((t) => (
          <TableRow key={t._id}>
            <TableCell className="font-medium">{t.rollNumber}</TableCell>
            <TableCell>{t.name}</TableCell>
            <TableCell>{t.email}</TableCell>
            <TableCell>{t.password}</TableCell>
            <TableCell>
              <Avatar className="w-8 h-8">
                <AvatarImage src={t.image} alt={`${t.name} profile picture`} />
                <AvatarFallback>{t.name.slice(0, 2)}</AvatarFallback>
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
              <Button
                className={buttonVariants({
                  size: "sm",
                  variant: "destructive",
                })}
                onClick={() => handleDelete(t._id)}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
