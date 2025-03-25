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
import { NoDataFeedBack } from "./NoDataFeedBack";
export const GetSubmitWorkForTeacher = () => {
  const { moduleId } = useParams() as { moduleId: string };
  const { data: submittedWorkByStudent } =
    trpc.getViewSubmitWorkForTeacher.useQuery({ moduleId });
  console.log(submittedWorkByStudent);
  return (
    <div>
      {submittedWorkByStudent?.length! > 0 ? (
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
          {submittedWorkByStudent?.map((work) => (
            <TableBody key={work._id}>
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
            </TableBody>
          ))}
        </Table>
      ) : (
        <NoDataFeedBack />
      )}
    </div>
  );
};
