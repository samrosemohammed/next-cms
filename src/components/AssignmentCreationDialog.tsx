"use client";
import { Plus, Trash } from "lucide-react";
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
}
export const AssignmentCreationDialog = ({
  userId,
  openFromEdit,
  setOpenFromEdit,
  assignmentInfo,
}: AssignmentCreationDialogProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const isOpen = openFromEdit !== undefined ? openFromEdit : open;
  const setIsOpen = setOpenFromEdit !== undefined ? setOpenFromEdit : setOpen;
  const { startUpload } = useUploadThing("imageUploader");
  const { data } = trpc.getAssignModuleForTeacher.useQuery();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { moduleId } = useParams() as { moduleId: string };
  const createAssignment = trpc.createAssignments.useMutation({
    onSuccess: (data) => {
      console.log("Assignment created successfully", data);
      setOpen(false);
      toast.success(data.message);
    },
    onError: (err) => {
      console.log("Error creating assignment", err);
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
    setValue("dueDate", selectedDate);
  };

  const uniqueGroups = data
    ? Array.from(new Map(data.map((d) => [d.group?._id, d])).values())
    : [];

  const onSubmit = async (data: AssignmentFormData) => {
    console.log("Form data", data);
    try {
      const files = data.files as File[];
      if (files.length > 0) {
        const fileUploads = await startUpload(files);
        const fileData = fileUploads?.map((file) => ({
          name: file.name,
          url: file.ufsUrl,
          key: file.key,
        }));
        createAssignment.mutateAsync({ ...data, files: fileData });
      }
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (assignmentInfo) {
      setValue("title", assignmentInfo.title);
      setValue("description", assignmentInfo.description);
      setValue("groupId", assignmentInfo.groupId);
      setValue("links", assignmentInfo.links);
      setValue("files", assignmentInfo.files);
      setDate(assignmentInfo.dueDate);
    }
  }, [assignmentInfo, setValue]);

  console.log("Assignment Info", assignmentInfo);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          Create Assignment <Plus className="ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Assignment</DialogTitle>
          <DialogDescription>
            Add a assignment with due date. Click "Create" when you're done.
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
            <Select onValueChange={(value) => setValue("groupId", value)}>
              <SelectTrigger className="">
                <SelectValue placeholder="Select a Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Group</SelectLabel>
                  {uniqueGroups?.map((d) => (
                    <SelectItem key={d?.group?._id} value={d.group?._id!}>
                      {d.group?.groupName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.groupId && (
              <p className="text-red-500 text-sm">
                {errors.groupId.message?.toString()}
              </p>
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
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
