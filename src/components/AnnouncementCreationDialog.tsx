"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Loader2, Plus, Trash } from "lucide-react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "./ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { trpc } from "@/app/_trpc/client";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AnnouncementFormData,
  announcementSchema,
} from "@/lib/validator/zodValidation";
import { ChangeEvent, useEffect, useState } from "react";
import { Input } from "./ui/input";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useUploadThing } from "@/lib/uploadthing";

interface AnnouncementCreationDialogProps {
  userId?: string;
  openFromEdit?: boolean;
  setOpenFromEdit?: (open: boolean) => void;
  announcementId?: string;
  announcementInfo?: AnnouncementFormData;
}
export const AnnouncementCreationDialog = ({
  userId,
  openFromEdit,
  setOpenFromEdit,
  announcementId,
  announcementInfo,
}: AnnouncementCreationDialogProps) => {
  const utils = trpc.useUtils();
  const [open, setOpen] = useState<boolean>(false);
  const isOpen = openFromEdit !== undefined ? openFromEdit : open;
  const setIsOpen = setOpenFromEdit !== undefined ? setOpenFromEdit : setOpen;
  const { data } = trpc.getAssignModuleForTeacher.useQuery();
  const { moduleId } = useParams() as { moduleId: string };
  const { startUpload } = useUploadThing("imageUploader");
  const [isLoading, setIsLoading] = useState(false);

  const createAnnouncement = trpc.createModuleAnnouncement.useMutation({
    onSuccess: (data) => {
      setIsLoading(false);
      utils.getAnnouncement.invalidate();
      setOpen(false);
      toast.success(data.message);
    },
    onError: (err) => {
      setIsLoading(false);
      toast.error(err.message);
    },
  });

  const editAnnouncement = trpc.editModuleAnnouncement.useMutation({
    onSuccess: (data) => {
      setIsLoading(false);
      utils.getAnnouncement.invalidate();
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
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      teacherId: userId,
      moduleId: moduleId || "",
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
  // Handle File Change
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
  const onSubmit = async (data: AnnouncementFormData) => {
    setIsLoading(true);
    const allFiles = data.files as (
      | File
      | { key: string; name: string; url: string }
    )[];
    // Separate new files (File objects) and existing files (already uploaded)
    const existingFiles = allFiles.filter(
      (file) => typeof file !== "object" || "url" in file
    );
    const newFiles = allFiles.filter((file) => file instanceof File) as File[];
    let uploadedFiles: { name: string; url: string; key: string }[] = [];
    // Upload only new files
    if (newFiles.length > 0) {
      const fileUploads = await startUpload(newFiles);
      if (!fileUploads) {
        toast.error("File upload failed!");
        return;
      }

      uploadedFiles = fileUploads.map((file) => ({
        name: file.name,
        url: file.ufsUrl,
        key: file.key,
      }));
    }

    const finalFiles = [...existingFiles, ...uploadedFiles]; // Merge old & new files
    if (announcementInfo) {
      await editAnnouncement.mutateAsync({
        id: announcementId ?? "",
        announcementSchema: { ...data, files: finalFiles },
      });
    } else {
      await createAnnouncement.mutateAsync({ ...data, files: finalFiles });
    }
  };
  const uniqueGroups = data
    ? Array.from(new Map(data.map((d) => [d.group?._id, d])).values())
    : [];

  useEffect(() => {
    if (announcementInfo) {
      setValue("description", announcementInfo.description);
      setValue("links", announcementInfo.links);
      setValue("files", announcementInfo.files);
      setValue("groupId", announcementInfo.groupId);
    }
  }, [announcementInfo, setValue]);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!announcementInfo && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="ml-2" />{" "}
            {announcementInfo ? "Edit Announcement" : "Create Announcement"}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {announcementInfo ? "Edit Announcement" : "Create Announcement"}
          </DialogTitle>
          <DialogDescription>
            {announcementInfo
              ? "Edit the announcement details. Click save when you're done"
              : "Create an announcement for your students. You can add a title, description, and any relevant links or attachments."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* descrtiption input */}
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
          {/* group selection */}
          <div className="space-y-2">
            <Label htmlFor="group">Group</Label>
            <Select
              defaultValue={announcementInfo?.groupId}
              onValueChange={(value) => setValue("groupId", value)}
            >
              <SelectTrigger>
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
              <p className="text-red-500 text-sm">
                {errors.groupId.message?.toString()}
              </p>
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
              {announcementInfo ? "Save " : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
