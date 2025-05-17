"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
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
import { trpc } from "@/app/_trpc/client";
import {
  Database,
  EllipsisVertical,
  File,
  Link2,
  Pencil,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { useParams } from "next/navigation";
import { formatDate } from "@/lib/formatDate";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState } from "react";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";
import { AssignmentCreationDialog } from "./AssignmentCreationDialog";
import { AssignmentFormData } from "@/lib/validator/zodValidation";
import { Loader } from "./Loader";
import { Empty } from "./Empty";
interface GetAssignmentProps {
  selectedGroupId?: string | null;
}
export const GetAssignment = ({ selectedGroupId }: GetAssignmentProps) => {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
  const [isDeleteAleartOpen, setIsDeleteAleartOpen] = useState<boolean>(false);
  const [isEditAssignmentOpen, setIsEditAssignmentOpen] =
    useState<boolean>(false);
  const [selectedAssignmentInfo, setSelectedAssignmentInfo] =
    useState<AssignmentFormData>();
  const { moduleId } = useParams() as { moduleId: string };
  const { data, isLoading: isAssignmentLoading } = trpc.getAssignment.useQuery({
    moduleId,
  });
  const utils = trpc.useUtils();
  const deleteAssignment = trpc.deleteAssignment.useMutation({
    onSuccess: (data) => {
      utils.getAssignment.invalidate();
      setIsDeleteAleartOpen(false);
      toast.success(data.message);
    },
    onError: (err) => {
      if (err instanceof TRPCClientError) {
        toast.error(err.message);
      }
    },
  });
  const handleDelete = (assignmentId: string) => {
    deleteAssignment.mutate({ id: assignmentId });
  };

  // Filter data by groupId if selected
  const filteredData = selectedGroupId
    ? data?.filter((file) => file.groupObjectId?._id === selectedGroupId)
    : data;

  return (
    <div>
      {isAssignmentLoading ? (
        <Loader />
      ) : filteredData?.length ? (
        <div className="p-4">
          {filteredData?.map((assignment) => (
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
                        {formatDate(assignment.createdAt)}
                      </p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <EllipsisVertical className="cursor-pointer" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setIsEditAssignmentOpen(true);
                              setSelectedAssignmentInfo({
                                title: assignment.title,
                                description: assignment.description,
                                links: assignment.links,
                                files: assignment.files,
                                groupId: assignment.groupObjectId?._id!,
                                teacherId: assignment.teacherObjectId?._id!,
                                moduleId: assignment.moduleObjectId?._id!,
                                dueDate: new Date(assignment.dueDate),
                              });
                              setSelectedAssignmentId(assignment._id);
                            }}
                          >
                            <Pencil />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedAssignmentId(assignment._id);
                              setIsDeleteAleartOpen(true);
                            }}
                          >
                            <Trash />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardDescription className="mt-2">
                    {assignment.description}
                  </CardDescription>
                </CardTitle>
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
            </Card>
          ))}
          {/* for assignment deletion */}
          <AlertDialog
            open={isDeleteAleartOpen}
            onOpenChange={setIsDeleteAleartOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your assignment information and remove your data from our
                  servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  })}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className={buttonVariants({
                    size: "sm",
                    variant: "destructive",
                  })}
                  onClick={() => handleDelete(selectedAssignmentId)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {isEditAssignmentOpen && (
            <AssignmentCreationDialog
              openFromEdit={isEditAssignmentOpen}
              setOpenFromEdit={setIsEditAssignmentOpen}
              assignmentInfo={selectedAssignmentInfo}
              assignmentId={selectedAssignmentId}
              userId={selectedAssignmentInfo?.teacherId}
            />
          )}
        </div>
      ) : (
        <Empty des="No assignment found. Please create an assignment" />
      )}
    </div>
  );
};
