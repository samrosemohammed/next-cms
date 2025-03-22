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
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useFieldArray, useForm } from "react-hook-form";
import {
  SubmitAssignmentFormData,
  submitAssignmentSchema,
} from "@/lib/validator/zodValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "sonner";
import { trpc } from "@/app/_trpc/client";

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
  const { startUpload } = useUploadThing("imageUploader");
  const [open, setOpen] = useState<boolean>(false);
  const isOpen = openFromEdit !== undefined ? openFromEdit : open;
  const setIsOpen = setOpenFromEdit !== undefined ? setOpenFromEdit : setOpen;
  const createSubmitWork = trpc.createSumbitAssignment.useMutation({
    onSuccess: () => {
      setOpen(false);
      toast.success("Assignment submitted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Submit Assignment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Assignmnet</DialogTitle>
          <DialogDescription>
            Submit your assignment work here.
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
            <Button variant="outline" type="button" onClick={() => addFile({})}>
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
            <Button variant="outline" type="button" onClick={() => addLink("")}>
              Add Link <Plus className="ml-2" size={16} />
            </Button>
            {errors.links && (
              <p className="text-red-500 text-sm">{errors.links.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit">Submit Work</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentAssignmentSubmitDialog;
