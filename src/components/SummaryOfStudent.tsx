"use client";
import { trpc } from "@/app/_trpc/client";
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
          {isSummaryLoading ? (
            <Loader />
          ) : summary?.studentInGroup?.length ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block rounded-md border">
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
                        <TableCell className="max-w-[200px] truncate">
                          {student.email}
                        </TableCell>
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
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {summary.studentInGroup.map((student) => (
                  <Card key={student._id} className="p-4">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage
                          src={student.image}
                          alt={`${student.name} image`}
                        />
                        <AvatarFallback>
                          {student.name?.[0]?.toUpperCase() || "N"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-sm font-medium truncate">
                            {student.name}
                          </h3>
                          <span className="text-xs text-muted-foreground ml-2">
                            ID: {student.rollNumber || "N/A"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Empty des="No students found in your group." />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
