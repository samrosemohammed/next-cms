"use client";
import { trpc } from "@/app/_trpc/client";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { File, Link2 } from "lucide-react";
import { formatDate } from "@/lib/formatDate";
import Link from "next/link";
import { Button, buttonVariants } from "./ui/button";
import StudentAssignmentSubmitDialog from "./StudentAssignmentSubmitDialog";
import { useState } from "react";
import ViewSubmitWork from "./ViewSubmitWork";

interface GetAssignmentForStudentProps {
  userId?: string;
}
const GetAssignmentForStudent = ({ userId }: GetAssignmentForStudentProps) => {
  const { moduleId } = useParams() as { moduleId: string };
  const { data: assignment } = trpc.getAssignmentForStudent.useQuery({
    moduleId,
  });

  return (
    <div className="p-4">
      {assignment?.map((assignment) => (
        <Card className="mb-4" key={assignment._id}>
          <CardHeader>
            <CardTitle>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <File className="w-4 h-4" />
                  {assignment.title}
                </div>
                <div className="flex items-center gap-2">
                  {assignment.dueDate && (
                    <span className="text-sm text-zinc-600">
                      Due: {formatDate(assignment.dueDate)}
                    </span>
                  )}
                  <span className="p-1 text-xs rounded bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80">
                    Group {assignment.groupObjectId?.groupName}
                  </span>
                  <p className="text-sm text-zinc-600">
                    {formatDate(assignment.updatedAt)}
                  </p>
                </div>
              </div>
            </CardTitle>
            <CardDescription className="mt-2">
              {assignment.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 space-x-2">
            {assignment.files &&
              assignment.files.map((f) => (
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
              ))}
            {assignment.links &&
              assignment.links.map((l, i) => (
                <Link
                  key={i}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={l}
                  className={`${buttonVariants({
                    variant: "outline",
                  })}`}
                >
                  <Link2 className="w-4 h-4" />
                  {"Link " + (i + 1)}
                </Link>
              ))}
          </CardContent>
          <CardFooter className="flex gap-2 justify-end">
            <ViewSubmitWork assignmentId={assignment._id} />
            <StudentAssignmentSubmitDialog
              clickAssignmentId={assignment._id}
              userId={userId}
            />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default GetAssignmentForStudent;
