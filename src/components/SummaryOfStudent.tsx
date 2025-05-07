"use client";
import { trpc } from "@/app/_trpc/client";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Loader2, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Empty } from "./Empty";
import { Loader } from "./Loader";

export const SummaryOfStudent = () => {
  const { data: summary, isLoading: isSummaryLoading } =
    trpc.summaryOfStudent.useQuery();
  console.log(summary);
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 my-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Modules Assigned
            </CardTitle>
            <Users size={18} />
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {summary?.totalModules}
                </div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Teacher Assigned
            </CardTitle>
            <Users size={18} />
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <>
                {" "}
                <div className="text-2xl font-bold">
                  {summary?.totalTeachers}
                </div>
                <p className="text-xs text-muted-foreground">
                  +1 from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Student</CardTitle>
            <Users size={18} />
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {summary?.totalStudents}
                </div>
                <p className="text-xs text-muted-foreground">
                  +1 from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-2xl">Students</CardTitle>
          <CardDescription>List of students in your group.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            {isSummaryLoading ? (
              <Loader />
            ) : summary?.studentInGroup?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Image</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.studentInGroup.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell>{student.rollNumber || "N/A"}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        <Avatar>
                          <AvatarImage
                            src={student.image}
                            alt={`${student.name} image`}
                          />
                          <AvatarFallback>
                            {student.name?.[0]?.toUpperCase() || "N"}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Empty
                des="No students found in your group.
"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
