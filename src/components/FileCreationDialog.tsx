"use client";
import { ChangeEvent, useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  ResourceFormData,
  resourceSchema,
} from "@/lib/validator/zodValidation";
import { trpc } from "@/app/_trpc/client";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useUploadThing } from "@/lib/uploadthing";

interface FileCreationDialogProps {
  userId: string;
}
export const FileCreationDialog = ({ userId }: FileCreationDialogProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const utils = trpc.useUtils();
  const { moduleId } = useParams() as { moduleId: string };
  const { startUpload } = useUploadThing("imageUploader");
  const createResource = trpc.createModuleResource.useMutation({
    onSuccess: (data) => {
      console.log("Resource created successfully", data);
      utils.getResourceFile.invalidate();
      setOpen(false);
      toast.success(data.message);
    },
    onError: (err) => {
      console.log("Error creating resource", err);
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
  } = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
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

  const onSubmit = async (data: ResourceFormData) => {
    console.log("Form data", data);
    const files = data.files as File[];
    if (files.length > 0) {
      const fileUploads = await startUpload(files);
      const fileData = fileUploads?.map((file) => ({
        name: file.name,
        url: file.ufsUrl,
        key: file.key,
      }));
      createResource.mutateAsync({ ...data, files: fileData });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          Upload Resource <Plus className="ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Resource</DialogTitle>
          <DialogDescription>
            Add links or upload files. Click "Create" when you're done.
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
