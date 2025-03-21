import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Plus, Trash } from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
interface StudentAssignmentSubmitDialogProps {
  userId?: string;
  clickAssignmentId?: string;
  openFromEdit?: boolean;
  setOpenFromEdit?: (open: boolean) => void;
}
const StudentAssignmentSubmitDialog = ({
  userId,
  clickAssignmentId,
  openFromEdit,
  setOpenFromEdit,
}: StudentAssignmentSubmitDialogProps) => {
  const utils = trpc.useUtils();
  const { startUpload } = useUploadThing("imageUploader");
  const [isDeleteAleartOpen, setIsDeleteAleartOpen] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const { moduleId } = useParams() as { moduleId: string };
  const isOpen = openFromEdit !== undefined ? openFromEdit : open;
  const setIsOpen = setOpenFromEdit !== undefined ? setOpenFromEdit : setOpen;
  const createSubmitWork = trpc.createSumbitAssignment.useMutation({
    onSuccess: (data) => {
      setOpen(false);
      utils.getSumbitWork.invalidate();
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteSubmitWork = trpc.deleteSubmitWork.useMutation({
    onSuccess: (data) => {
      setOpen(false);
      setIsDeleteAleartOpen(false);
      utils.getSumbitWork.invalidate();
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const { data: getSubmittedWork } = trpc.getSumbitWork.useQuery({ moduleId });
  console.log(getSubmittedWork);
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
    console.log("form data: ", data);
    const files = data.files as File[];
    if (files.length > 0) {
      const fileUploads = await startUpload(files);
      if (!fileUploads) {
        toast.error("Failed to upload files");
        return;
      }
      const fileData = fileUploads.map((file) => ({
        key: file.key,
        name: file.name,
        url: file.ufsUrl,
      }));
      createSubmitWork.mutate({ ...data, files: fileData });
    }
  };
  const hasSubmittedWork = getSubmittedWork?.some(
    (work) =>
      work.assignmentObjectId === clickAssignmentId &&
      work.studentObjectId === userId
  );

  const handleDelete = (assignmnetId: string) => {
    deleteSubmitWork.mutateAsync({ assignmnetId: assignmnetId });
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
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
                type="submit"
                className={`${
                  hasSubmittedWork
                    ? buttonVariants({
                        variant: "edit",
                      })
                    : ""
                }`}
              >
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
              resources information and remove your data from our servers.
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
              onClick={() => handleDelete(clickAssignmentId)}
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
