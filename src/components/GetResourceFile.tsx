"use client";
import { trpc } from "@/app/_trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useParams } from "next/navigation";
import {
  Bookmark,
  Database,
  EllipsisVertical,
  File,
  Link2,
  Loader2,
  Pencil,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/formatDate";
import { buttonVariants } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
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
import { useState } from "react";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";
import { ResourceFormData } from "@/lib/validator/zodValidation";
import { FileCreationDialog } from "./FileCreationDialog";
import { Empty } from "./Empty";
import { Loader } from "./Loader";

interface GetResourceFileProps {
  selectedGroupId?: string | null;
}
export const GetResourceFile = ({ selectedGroupId }: GetResourceFileProps) => {
  const utils = trpc.useUtils();
  const { moduleId } = useParams() as { moduleId: string };
  const { data, isLoading: isResourceLoading } = trpc.getResourceFile.useQuery({
    moduleId,
  });
  const [selectedFileId, setSelectedFileId] = useState<string>("");
  const [isDeleteAleartOpen, setIsDeleteAleartOpen] = useState<boolean>(false);
  const [isEditResourceOpen, setIseditResourceOpen] = useState<boolean>(false);
  const [selectedResourceInfo, setSelectedResourceInfo] =
    useState<ResourceFormData>();
  const deleteResource = trpc.deleteResource.useMutation({
    onSuccess: (data) => {
      utils.getResourceFile.invalidate();
      setIsDeleteAleartOpen(false);
      toast.success(data.message);
    },
    onError: (err) => {
      console.log("Error deleting resource", err);
      if (err instanceof TRPCClientError) {
        toast.error(err.message);
      }
    },
  });
  const handleDelete = async (fileId: string) => {
    deleteResource.mutateAsync({ id: fileId });
  };

  // Filter data by groupId if selected
  const filteredData = selectedGroupId
    ? data?.filter((file) => file.groupObjectId?._id === selectedGroupId)
    : data;

  return (
    <div>
      {isResourceLoading ? (
        <Loader />
      ) : filteredData?.length ? (
        <div className="p-4">
          {filteredData?.map((file) => (
            <Card className="mb-4" key={file._id}>
              <CardHeader>
                <CardTitle>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <File className="w-4 h-4" />
                      {file.title}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="p-1 text-xs rounded bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80">
                        Group {file.groupObjectId?.groupName}
                      </span>
                      <p className="text-sm text-zinc-600">
                        {formatDate(file.createdAt)}
                      </p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <EllipsisVertical className="cursor-pointer" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setIseditResourceOpen(true);
                              setSelectedResourceInfo({
                                title: file.title,
                                moduleId: file?.moduleObjectId?._id!,
                                teacherId: file?.teacherObjectId?._id!,
                                groupId: file?.groupObjectId?._id!,
                                description: file.description,
                                links: file.links,
                                files: file.files,
                              });
                              setSelectedFileId(file._id);
                            }}
                          >
                            <Pencil />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedFileId(file._id);
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
                    {file.description}
                  </CardDescription>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 space-x-2">
                {file.files &&
                  file.files.map((f, index) => (
                    <Link
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 ${buttonVariants({
                        variant: "outline",
                      })}`}
                      href={f.url}
                      key={`${f.key}-${index}`}
                    >
                      <File className="w-4 h-4" />
                      {f.name}
                    </Link>
                  ))}
                {file.links &&
                  file.links.map((l, i) => (
                    <Link
                      key={`link-${file._id}-${i}`}
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

          {/* for file deletion */}
          <AlertDialog
            open={isDeleteAleartOpen}
            onOpenChange={setIsDeleteAleartOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your resources information and remove your data from our
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
                  onClick={() => handleDelete(selectedFileId)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {isEditResourceOpen && (
            <FileCreationDialog
              resourceInfo={selectedResourceInfo}
              openFromEdit={isEditResourceOpen}
              setOpenFromEdit={setIseditResourceOpen}
              resourceId={selectedFileId}
              userId={selectedResourceInfo?.teacherId}
            />
          )}
        </div>
      ) : (
        <Empty des="No file found. Please upload/create a resource." />
      )}
    </div>
  );
};
