"use client";

import { trpc } from "@/app/_trpc/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2, Search, Users } from "lucide-react";
import { ChangeEvent, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Empty } from "./Empty";
import { Loader } from "./Loader";

export const GroupStudent = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const { data: student, isLoading: isStudentLoading } =
    trpc.getGroupStudentAssignToTeacher.useQuery();
  const { data: count, isLoading: isCountLoading } =
    trpc.getCountForTeacher.useQuery();
  console.log(count);
  const filteredStudents = student?.filter((s) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      s?.name?.toLowerCase().includes(query) ||
      s?.rollNumber?.toLowerCase().includes(query) ||
      s?.email?.toLowerCase().includes(query);
    const matchesGroup = selectedGroup ? s?.group?._id === selectedGroup : true;
    return matchesSearch && matchesGroup;
  });

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleGroupChange = (value: string) => {
    setSelectedGroup(value);
  };
  console.log(student);
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
            {isCountLoading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <>
                {" "}
                <div className="text-2xl font-bold">
                  {count?.totalModuleAssignments}
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
              Groups Assigned
            </CardTitle>
            <Users size={18} />
          </CardHeader>
          <CardContent>
            {isCountLoading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <>
                {" "}
                <div className="text-2xl font-bold">
                  {count?.totalGroupsAssigned}
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
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users size={18} />
          </CardHeader>
          <CardContent>
            {isCountLoading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <>
                {" "}
                <div className="text-2xl font-bold">{count?.totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                  +8 from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div>
            <CardTitle className="text-2xl">Students</CardTitle>
            <CardDescription>
              Manage your students across different groups.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 items-center mb-4 max-w-lg ml-auto">
            <Select onValueChange={handleGroupChange}>
              <SelectTrigger className="">
                <SelectValue placeholder="Sort with Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Group</SelectLabel>
                  {count?.uniqueGroups?.map((group) => (
                    <SelectItem key={group?._id} value={group?._id ?? ""}>
                      {group?.groupName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="relative w-full max-w-sm"
            >
              <Input
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search for anything..."
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-full px-3"
              >
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </form>
          </div>
          <div className="rounded-md border">
            {isStudentLoading ? (
              <Loader />
            ) : student?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Image</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents?.map((s) => (
                    <TableRow key={s._id}>
                      <TableCell>{s?.rollNumber}</TableCell>
                      <TableCell>{s?.name}</TableCell>
                      <TableCell>Group {s?.group?.groupName}</TableCell>
                      <TableCell>{s?.email}</TableCell>
                      <TableCell>
                        <Avatar>
                          <AvatarImage
                            src={s?.image}
                            alt={`${s?.name} image`}
                          />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Empty des="No student data found." />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
