"use client";
import { Loader2, Plus, Trash } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ChangeEvent, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import {
  AssignmentFormData,
  assignmentSchema,
} from "@/lib/validator/zodValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import { DatePicker } from "./DatePicker";
import { toast } from "sonner";
import { useUploadThing } from "@/lib/uploadthing";

interface AssignmentCreationDialogProps {
  userId?: string;
  openFromEdit?: boolean;
  setOpenFromEdit?: (open: boolean) => void;
  assignmentInfo?: AssignmentFormData;
  assignmentId?: string;
}
export const AssignmentCreationDialog = ({
  userId,
  openFromEdit,
  setOpenFromEdit,
  assignmentInfo,
  assignmentId,
}: AssignmentCreationDialogProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const utils = trpc.useUtils();
  const [open, setOpen] = useState<boolean>(false);
  const isOpen = openFromEdit !== undefined ? openFromEdit : open;
  const setIsOpen = setOpenFromEdit !== undefined ? setOpenFromEdit : setOpen;
  const { startUpload } = useUploadThing("imageUploader");
  const { data } = trpc.getAssignModuleForTeacher.useQuery();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { moduleId } = useParams() as { moduleId: string };
  const createAssignment = trpc.createAssignments.useMutation({
    onSuccess: (data) => {
      setIsLoading(false);
      utils.getAssignment.invalidate();
      setOpen(false);
      toast.success(data.message);
    },
    onError: (err) => {
      setIsLoading(false);
      toast.error(err.message);
    },
  });
  const editAssignment = trpc.editModuleAssignment.useMutation({
    onSuccess: (data) => {
      setIsLoading(false);
      utils.getAssignment.invalidate();
      setIsOpen(false);
      toast.success(data.message);
    },
    onError: (err) => {
      setIsLoading(false);
      toast.error(err.message);
    },
  });
  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: "",
      description: "",
      links: [""],
      files: [],
      moduleId: moduleId || "",
      teacherId: userId,
    },
  });
  // Manage Links using useFieldArray
  const {
    fields: linkFields,
    append: addLink,
    remove: removeLink,
  } = useFieldArray({
    control,
    name: "links",
  });

  // Manage Files using useFieldArray
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

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      setValue("dueDate", selectedDate);
    }
  };

  const uniqueGroups = data
    ? Array.from(new Map(data.map((d) => [d.group?._id, d])).values())
    : [];

  const onSubmit = async (data: AssignmentFormData) => {
    setIsLoading(true);
    const allFiles = data.files as (
      | File
      | { key: string; name: string; url: string }
    )[];
    const existingFiles = allFiles.filter(
      (file) => typeof file !== "object" || "url" in file
    );
    const newFiles = allFiles.filter((file) => file instanceof File) as File[];
    let uploadedFiles: { name: string; url: string; key: string }[] = [];
    if (newFiles.length > 0) {
      const fileUploads = await startUpload(newFiles);
      if (!fileUploads) {
        toast.error("File upload failed");
        return;
      }
      uploadedFiles = fileUploads.map((file) => ({
        name: file.name,
        url: file.ufsUrl,
        key: file.key,
      }));
    }
    const finalFiles = [...existingFiles, ...uploadedFiles];

    // Ensure links and files are passed as arrays
    const payload = {
      ...data,
      links: data.links || [], // Default to an empty array if not provided
      files: finalFiles || [], // Default to an empty array if no files
    };
    if (assignmentInfo) {
      await editAssignment.mutateAsync({
        id: assignmentId!,
        assignmentSchema: payload,
      });
    } else {
      await createAssignment.mutateAsync(payload);
    }
  };

  useEffect(() => {
    if (assignmentInfo) {
      setValue("title", assignmentInfo.title);
      setValue("description", assignmentInfo.description);
      setValue("groupId", assignmentInfo.groupId);
      setValue("links", assignmentInfo.links);
      setValue("files", assignmentInfo.files);
      setValue("dueDate", assignmentInfo.dueDate); // Ensure dueDate is set
      setDate(assignmentInfo.dueDate);
    }
  }, [assignmentInfo, setValue]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          {assignmentInfo ? "Edit Assignment" : "Create Assignment"}
          <Plus className="ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {assignmentInfo ? "Edit Assignment" : "Create Assignment"}
          </DialogTitle>
          <DialogDescription>
            {assignmentInfo
              ? "Edit the assignment details. Click save when you're done"
              : " Add a assignment with due date. Click Create when you're done."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              {...register("description")}
              placeholder="Type your description here."
            />
            {errors.description && (
              <p className="text-red-500 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="group">Group</Label>
            <Select
              defaultValue={assignmentInfo?.groupId}
              onValueChange={(value) => setValue("groupId", value)}
            >
              <SelectTrigger className="">
                <SelectValue placeholder="Select a Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Group</SelectLabel>
                  {uniqueGroups?.map((d) => (
                    <SelectItem key={d?.group?._id} value={d.group?._id ?? ""}>
                      {d.group?.groupName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.groupId && (
              <p className="text-red-500 text-sm">{errors.groupId.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <DatePicker date={date} setDate={handleDateChange} />
            {date && (
              <div className="mt-4 rounded-md bg-muted p-2">
                <p className="text-xs font-medium">Selected Date and Time:</p>
                <p className="text-xs text-muted-foreground">
                  {date.toLocaleString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                  })}
                </p>
              </div>
            )}
            {errors.dueDate && (
              <p className="text-red-500 text-sm">{errors.dueDate.message}</p>
            )}
          </div>

          {/* Links Section */}
          <div className="space-y-2 space-x-2">
            <Label>Links</Label>
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

          {/* File Upload Section */}
          <div className="space-y-2 space-x-2">
            <Label>Files</Label>
            {fileFields.map((file, index) => {
              const selectedFile = getValues("files")?.[index]; // Get selected file
              return (
                <div key={file.id} className="flex gap-2 items-center">
                  <Input
                    type="file"
                    onChange={(e) => handleFileChange(index, e)}
                    className="hidden" // Hide actual file input
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

          <DialogFooter>
            <Button disabled={isLoading} type="submit">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {assignmentInfo ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
