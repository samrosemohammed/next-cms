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
import { Loader2, Search, Users, Mail, Hash } from "lucide-react";
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

  return (
    <div className="w-full max-w-full overflow-x-hidden px-2 sm:px-6 lg:px-8">
      {/* Stats Cards - Responsive Grid */}
      <div className="w-full grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 my-4">
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
        <Card className="sm:col-span-2 lg:col-span-1">
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
                <div className="text-2xl font-bold">{count?.totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                  +8 from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="w-full max-w-full">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 px-4 sm:px-6">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl sm:text-2xl">Students</CardTitle>
            <CardDescription>
              Manage your students across different groups.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {/* Search and Filter - Mobile Responsive */}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 items-stretch sm:items-center mb-6 w-full">
            <div className="w-full sm:w-auto sm:min-w-[180px] sm:max-w-[220px]">
              <Select onValueChange={handleGroupChange}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Filter by Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Groups</SelectLabel>
                    <SelectItem value="all">All Groups</SelectItem>
                    {count?.uniqueGroups?.map((group) => (
                      <SelectItem key={group?._id} value={group?._id ?? ""}>
                        {group?.groupName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 w-full sm:max-w-sm">
              <form
                onSubmit={(e) => e.preventDefault()}
                className="relative w-full"
              >
                <Input
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search students..."
                  className="w-full h-10 pr-10"
                />
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                >
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span className="sr-only">Search</span>
                </Button>
              </form>
            </div>
          </div>

          {/* Content Area */}
          <div className="w-full max-w-full overflow-hidden">
            {isStudentLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader />
              </div>
            ) : student?.length ? (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  <div className="rounded-md border overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[120px] font-semibold">
                              Student ID
                            </TableHead>
                            <TableHead className="min-w-[160px] font-semibold">
                              Student
                            </TableHead>
                            <TableHead className="min-w-[140px] font-semibold">
                              Group
                            </TableHead>
                            <TableHead className="min-w-[200px] font-semibold">
                              Email
                            </TableHead>
                            <TableHead className="min-w-[80px] font-semibold">
                              Avatar
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStudents?.map((s) => (
                            <TableRow key={s._id} className="hover:bg-muted/50">
                              <TableCell className="font-medium">
                                {s?.rollNumber}
                              </TableCell>
                              <TableCell className="font-medium">
                                {s?.name}
                              </TableCell>
                              <TableCell>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {s?.group?.groupName}
                                </span>
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate text-muted-foreground">
                                {s?.email}
                              </TableCell>
                              <TableCell>
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={s?.image}
                                    alt={`${s?.name} avatar`}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {s?.name?.slice(0, 2)?.toUpperCase() ||
                                      "CN"}
                                  </AvatarFallback>
                                </Avatar>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden">
                  <div className="space-y-4">
                    {filteredStudents?.map((s) => (
                      <div
                        key={s._id}
                        className="bg-card border rounded-lg shadow-sm overflow-hidden"
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <Avatar className="h-12 w-12 flex-shrink-0">
                              <AvatarImage
                                src={s?.image}
                                alt={`${s?.name} avatar`}
                              />
                              <AvatarFallback className="text-sm font-medium">
                                {s?.name?.slice(0, 2)?.toUpperCase() || "CN"}
                              </AvatarFallback>
                            </Avatar>

                            {/* Student Info */}
                            <div className="flex-1 min-w-0 space-y-3">
                              {/* Name and Group */}
                              <div className="space-y-2">
                                <h3 className="font-semibold text-base leading-tight">
                                  {s?.name}
                                </h3>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {s?.group?.groupName}
                                </span>
                              </div>

                              {/* Student Details */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Hash className="w-4 h-4 flex-shrink-0" />
                                  <span className="font-medium">
                                    {s?.rollNumber}
                                  </span>
                                </div>
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <Mail className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                  <span className="break-all leading-tight">
                                    {s?.email}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex justify-center items-center py-12">
                <Empty des="No student data found." />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
