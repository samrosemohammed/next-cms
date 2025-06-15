"use client";
import { trpc } from "@/app/_trpc/client";
import { useParams } from "next/navigation";
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { File, Link2 } from "lucide-react";
import { formatDate } from "@/lib/formatDate";
import { Loader } from "./Loader";
import { Empty } from "./Empty";

export const GetSubmitWorkForTeacher = () => {
  const { moduleId } = useParams() as { moduleId: string };
  const { data: submittedWorkByStudent, isLoading } =
    trpc.getViewSubmitWorkForTeacher.useQuery({ moduleId });

  return (
    <div className="mt-4 sm:p-0 p-2">
      {isLoading ? (
        <Loader />
      ) : submittedWorkByStudent && submittedWorkByStudent.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableCaption>Submitted work by student</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Module Name</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Assignment Title</TableHead>
                  <TableHead>Submitted File</TableHead>
                  <TableHead>Submitted Link</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submittedWorkByStudent?.map((work) => (
                  <TableRow key={work._id}>
                    <TableCell>{work?.moduleObjectId?.name}</TableCell>
                    <TableCell>
                      <span className="p-1 text-xs rounded bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80">
                        Group {work?.groupObjectId?.groupName}
                      </span>
                    </TableCell>
                    <TableCell>{work?.studentObjectId?.name}</TableCell>
                    <TableCell>{work?.assignmentObjectId?.title}</TableCell>
                    <TableCell>
                      {work?.files
                        ? work?.files?.map((f) => (
                            <Link
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`p-2 ${buttonVariants({
                                variant: "outline",
                              })}`}
                              href={f.url}
                              key={f.key}
                            >
                              <File className="w-4 h-4" />
                              {f.name}
                            </Link>
                          ))
                        : null}
                    </TableCell>
                    <TableCell>
                      {work?.links
                        ? work?.links?.map((link) => (
                            <Link
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`truncate p-2 ${buttonVariants({
                                variant: "outline",
                              })}`}
                              href={link}
                              key={link}
                            >
                              <Link2 className="w-4 h-4" />
                              {link}
                            </Link>
                          ))
                        : null}
                    </TableCell>
                    <TableCell>
                      {work?.assignmentObjectId?.dueDate
                        ? formatDate(work?.assignmentObjectId.dueDate)
                        : null}
                    </TableCell>
                    <TableCell>
                      {work?.createdAt ? formatDate(work?.createdAt) : null}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`${
                          work?.status === "Late"
                            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        } shadow px-2 py-1 rounded`}
                      >
                        {work?.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Submitted work by student
            </p>
            {submittedWorkByStudent?.map((work) => (
              <div
                key={work._id}
                className="border rounded-lg p-4 bg-card shadow-sm"
              >
                <div className="space-y-3">
                  {/* Header with Status */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-base">
                        {work?.assignmentObjectId?.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {work?.moduleObjectId?.name}
                      </p>
                    </div>
                    <span
                      className={`${
                        work?.status === "Late"
                          ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      } shadow px-2 py-1 rounded text-sm`}
                    >
                      {work?.status}
                    </span>
                  </div>

                  {/* Student and Group */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="font-medium text-sm">
                      {work?.studentObjectId?.name}
                    </span>
                    <span className="p-1 text-xs rounded bg-secondary text-secondary-foreground shadow-sm">
                      Group {work?.groupObjectId?.groupName}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Due Date:</span>
                      <span>
                        {work?.assignmentObjectId?.dueDate
                          ? formatDate(work?.assignmentObjectId.dueDate)
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Submitted:</span>
                      <span>
                        {work?.createdAt ? formatDate(work?.createdAt) : "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Files */}
                  {work?.files && work?.files?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Files:</p>
                      <div className="flex flex-wrap gap-2">
                        {work?.files?.map((f) => (
                          <Link
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-xs p-2 ${buttonVariants({
                              variant: "outline",
                              size: "sm",
                            })}`}
                            href={f.url}
                            key={f.key}
                          >
                            <File className="w-3 h-3 mr-1" />
                            {f.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Links */}
                  {work?.links && work?.links?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Links:</p>
                      <div className="space-y-2">
                        {work?.links?.map((link) => (
                          <Link
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`block text-xs p-2 ${buttonVariants({
                              variant: "outline",
                              size: "sm",
                            })}`}
                            href={link}
                            key={link}
                          >
                            <Link2 className="w-3 h-3 mr-1" />
                            <span className="truncate">{link}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <Empty des="No submit work found. Please check back later." />
      )}
    </div>
  );
};
