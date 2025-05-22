import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Loader2, Plus, Trash } from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useFieldArray, useForm } from "react-hook-form";
import {
  SubmitAssignmentFormData,
  submitAssignmentSchema,
} from "@/lib/validator/zodValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useEffect, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "sonner";
import { trpc } from "@/app/_trpc/client";
import { useParams } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
interface StudentAssignmentSubmitDialogProps {
  userId?: string;
  clickAssignmentId?: string;
  openFromEdit?: boolean;
  setOpenFromEdit?: (open: boolean) => void;
  isPastDueDate?: boolean;
  studentGroupId?: string;
}
const StudentAssignmentSubmitDialog = ({
  userId,
  clickAssignmentId,
  openFromEdit,
  setOpenFromEdit,
  isPastDueDate,
  studentGroupId,
}: StudentAssignmentSubmitDialogProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const utils = trpc.useUtils();
  const { startUpload } = useUploadThing("imageUploader");
  const [isDeleteAleartOpen, setIsDeleteAleartOpen] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const { moduleId } = useParams() as { moduleId: string };
  const isOpen = openFromEdit !== undefined ? openFromEdit : open;
  const setIsOpen = setOpenFromEdit !== undefined ? setOpenFromEdit : setOpen;
  const createSubmitWork = trpc.createSumbitAssignment.useMutation({
    onSuccess: (data) => {
      setIsLoading(false);
      setOpen(false);
      utils.getSumbitWork.invalidate();
      utils.getViewSubmitWork.invalidate();
      toast.success(data.message);
    },
    onError: (error) => {
      setIsLoading(false);
      toast.error(error.message);
    },
  });

  const reSubmitWork = trpc.editSubmitWork.useMutation({
    onSuccess: (data) => {
      setIsLoading(false);
      setOpen(false);
      utils.getSumbitWork.invalidate();
      utils.getViewSubmitWork.invalidate();
      toast.success(data.message);
    },
    onError: (err) => {
      setIsLoading(false);
      toast.error(err.message);
    },
  });

  const deleteSubmitWork = trpc.deleteSubmitWork.useMutation({
    onSuccess: (data) => {
      setIsLoading(false);
      setOpen(false);
      setIsDeleteAleartOpen(false);
      utils.getSumbitWork.invalidate();
      utils.getViewSubmitWork.invalidate();
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const { data: getSubmittedWork } = trpc.getSumbitWork.useQuery({ moduleId });
  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<SubmitAssignmentFormData>({
    resolver: zodResolver(submitAssignmentSchema),
    defaultValues: {
      studentId: userId!,
      assignmentId: clickAssignmentId!,
      moduleId: moduleId!,
      groupId: studentGroupId!,
    },
  });

  const {
    fields: linkFields,
    append: addLink,
    remove: removeLink,
  } = useFieldArray({
    control,
    name: "links",
  });

  const {
    fields: fileFields,
    append: addFile,
    remove: removeFile,
  } = useFieldArray({
    control,
    name: "files",
  });

  const handleFileChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files?.[0]) {
      const currentFiles = getValues("files") || [];
      currentFiles[index] = event.target.files[0]; // Update file in array
      setValue("files", [...currentFiles]); // Update form state
    }
  };

  const onSubmit = async (data: SubmitAssignmentFormData) => {
    setIsLoading(true);
    const allFiles = data.files as (
      | File
      | { key: string; name: string; url: string }
    )[];
    const existingFiles = allFiles.filter(
      (file) => typeof file !== "object" || "url" in file
    );
    const newFiles = allFiles.filter((file) => file instanceof File) as File[];
    let uploadFiles: { name: string; url: string; key: string }[] = [];
    if (newFiles.length > 0) {
      const fileUploads = await startUpload(newFiles);
      if (!fileUploads) {
        toast.error("Failed to upload files");
        return;
      }
      uploadFiles = fileUploads.map((file) => ({
        name: file.name,
        url: file.ufsUrl,
        key: file.key,
      }));
    }
    const finalFiles = [...existingFiles, ...uploadFiles];
    if (hasSubmittedWork) {
      reSubmitWork.mutateAsync({
        id: clickAssignmentId!,
        submitAssignmentSchema: { ...data, files: finalFiles },
      });
    } else {
      createSubmitWork.mutateAsync({ ...data, files: finalFiles });
    }
  };

  const hasSubmittedWork = getSubmittedWork?.some((work) => {
    return (
      work?.assignmentObjectId?._id === clickAssignmentId &&
      work?.studentObjectId?._id === userId
    );
  });

  const handleDelete = (assignmnetId: string) => {
    setIsLoading(true);
    deleteSubmitWork.mutateAsync({ assignmnetId: assignmnetId });
  };

  useEffect(() => {
    if (hasSubmittedWork && getSubmittedWork) {
      const submittedWork = getSubmittedWork.find(
        (work) =>
          work?.assignmentObjectId?._id === clickAssignmentId &&
          work?.studentObjectId?._id === userId
      );
      if (submittedWork) {
        setValue("files", submittedWork.files || []);
        setValue("links", submittedWork.links || []);
      }
    }
  }, [hasSubmittedWork, getSubmittedWork, setValue, clickAssignmentId, userId]);

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {isPastDueDate ? (
            <span
              className={`${buttonVariants({
                variant: "destructive",
              })}`}
            >
              Missing
            </span>
          ) : (
            <Button
              className={`${
                hasSubmittedWork
                  ? buttonVariants({
                      variant: "edit",
                    })
                  : ""
              }`}
            >
              {hasSubmittedWork ? "Re-submit" : "Submit Assignment"}
            </Button>
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {hasSubmittedWork ? "Re-submit Assignment" : "Submit Assignment"}
            </DialogTitle>
            <DialogDescription>
              {hasSubmittedWork
                ? "Re-submit your assignment work here."
                : "Submit your assignment work here."}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2 space-x-2">
              <Label>Files</Label>
              {fileFields.map((file, index) => {
                const selectedFile = getValues("files")?.[index];
                return (
                  <div key={file.id} className="flex gap-2 items-center">
                    <Input
                      type="file"
                      onChange={(e) => handleFileChange(index, e)}
                      className="hidden"
                      id={`file-upload-${index}`}
                    />
                    <Label
                      htmlFor={`file-upload-${index}`}
                      className="cursor-pointer bg-gray-100 px-3 py-2 rounded-md border"
                    >
                      Choose File
                    </Label>
                    <span className="text-sm text-gray-600">
                      {selectedFile ? selectedFile.name : "No file selected"}
                    </span>
                    <Button
                      variant="destructive"
                      size="icon"
                      type="button"
                      onClick={() => removeFile(index)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                );
              })}
              <Button
                variant="outline"
                type="button"
                onClick={() => addFile({})}
              >
                Add File <Plus className="ml-2" size={16} />
              </Button>
              {errors.files && (
                <p className="text-red-500 text-sm">{errors.files.message}</p>
              )}
            </div>
            <div className="space-y-2 space-x-2">
              <Label>
                Link
                <span className="p-1 text-xs rounded bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80">
                  Optional
                </span>
              </Label>
              {linkFields.map((link, index) => (
                <div key={link.id} className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="Enter link"
                    {...register(`links.${index}` as const)}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    type="button"
                    onClick={() => removeLink(index)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                type="button"
                onClick={() => addLink("")}
              >
                Add Link <Plus className="ml-2" size={16} />
              </Button>
              {errors.links && (
                <p className="text-red-500 text-sm">{errors.links.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                disabled={isLoading}
                type="submit"
                className={`${
                  hasSubmittedWork
                    ? buttonVariants({
                        variant: "edit",
                      })
                    : ""
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                {hasSubmittedWork ? "Re-submit" : "Submit Work"}
              </Button>
              {hasSubmittedWork && (
                <Button
                  variant="destructive"
                  type="button"
                  onClick={() => {
                    setIsDeleteAleartOpen(true);
                  }}
                >
                  Unsubmit
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={isDeleteAleartOpen}
        onOpenChange={setIsDeleteAleartOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              submitted work information and remove your data from our servers.
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
              onClick={() => {
                if (clickAssignmentId) handleDelete(clickAssignmentId);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StudentAssignmentSubmitDialog;
