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
import { File, Link2, Calendar, Clock, Users } from "lucide-react";
import { formatDate } from "@/lib/formatDate";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import StudentAssignmentSubmitDialog from "./StudentAssignmentSubmitDialog";
import ViewSubmitWork from "./ViewSubmitWork";
import { Loader } from "./Loader";
import { Empty } from "./Empty";

interface GetAssignmentForStudentProps {
  userId?: string;
}

const GetAssignmentForStudent = ({ userId }: GetAssignmentForStudentProps) => {
  const { moduleId } = useParams() as { moduleId: string };
  const { data: assignment, isLoading: isAssignmentLoading } =
    trpc.getAssignmentForStudent.useQuery({
      moduleId,
    });
  const sortedAssignments = assignment?.slice().sort((a, b) => {
    return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
  });

  return (
    <div>
      {isAssignmentLoading ? (
        <Loader />
      ) : assignment?.length ? (
        <div className="p-2 sm:p-4 space-y-4">
          {sortedAssignments?.map((assignment) => {
            const dueDate = new Date(assignment.dueDate);
            const currentDate = new Date();
            const isPastDueDate = dueDate
              ? currentDate >
                new Date(dueDate.getTime() + 3 * 24 * 60 * 60 * 1000)
              : false;
            return (
              <Card className="w-full" key={assignment._id}>
                <CardHeader className="pb-3">
                  {/* Desktop Header */}
                  <div className="hidden md:block">
                    <CardTitle>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <File className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{assignment.title}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                          {assignment.dueDate && (
                            <span className="text-sm text-zinc-600 whitespace-nowrap">
                              Due: {formatDate(assignment.dueDate)}
                            </span>
                          )}
                          <span className="p-1 text-xs rounded bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 whitespace-nowrap">
                            Group {assignment.groupObjectId?.groupName}
                          </span>
                          <p className="text-sm text-zinc-600 whitespace-nowrap">
                            {formatDate(assignment.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </CardTitle>
                  </div>

                  {/* Mobile Header */}
                  <div className="md:hidden">
                    <CardTitle className="flex items-start gap-2 mb-3">
                      <File className="w-4 h-4 flex-shrink-0 mt-1" />
                      <span className="text-base leading-tight">
                        {assignment.title}
                      </span>
                    </CardTitle>

                    {/* Mobile Meta Info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-3 h-3" />
                          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                            Group {assignment.groupObjectId?.groupName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatDate(assignment.updatedAt)}
                        </div>
                      </div>

                      {assignment.dueDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Due: {formatDate(assignment.dueDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <CardDescription className="mt-2 text-sm leading-relaxed">
                    {assignment.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {/* Files and Links Section */}
                  {(assignment.files?.length > 0 ||
                    (assignment.links?.length ?? 0) > 0) && (
                    <div className="space-y-3">
                      {/* Files */}
                      {assignment.files && assignment.files.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 md:hidden">
                            Attached Files:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {assignment.files.map((f) => (
                              <Link
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-2 p-2 text-sm ${buttonVariants(
                                  {
                                    variant: "outline",
                                    size: "sm",
                                  }
                                )}`}
                                href={f.url}
                                key={f.key}
                              >
                                <File className="w-3 h-3" />
                                <span className="truncate max-w-[120px] sm:max-w-none">
                                  {f.name}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Links */}
                      {assignment.links && assignment.links.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 md:hidden">
                            Reference Links:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {assignment.links.map((l, i) => (
                              <Link
                                key={i}
                                target="_blank"
                                rel="noopener noreferrer"
                                href={l}
                                className={`inline-flex items-center gap-2 p-2 text-sm ${buttonVariants(
                                  {
                                    variant: "outline",
                                    size: "sm",
                                  }
                                )}`}
                              >
                                <Link2 className="w-3 h-3" />
                                <span>Link {i + 1}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-3">
                  {/* Desktop Footer */}
                  <div className="hidden sm:flex gap-2 justify-end w-full">
                    <ViewSubmitWork assignmentId={assignment._id} />
                    <StudentAssignmentSubmitDialog
                      clickAssignmentId={assignment._id}
                      userId={userId}
                      isPastDueDate={isPastDueDate}
                      studentGroupId={assignment.groupObjectId?._id ?? ""}
                    />
                  </div>

                  {/* Mobile Footer */}
                  <div className="sm:hidden flex justify-between items-center gap-2 w-full">
                    <ViewSubmitWork assignmentId={assignment._id} />
                    <StudentAssignmentSubmitDialog
                      clickAssignmentId={assignment._id}
                      userId={userId}
                      isPastDueDate={isPastDueDate}
                      studentGroupId={assignment.groupObjectId?._id ?? ""}
                    />
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <Empty des="No module assignment added currently. Please check back later." />
      )}
    </div>
  );
};

export default GetAssignmentForStudent;
