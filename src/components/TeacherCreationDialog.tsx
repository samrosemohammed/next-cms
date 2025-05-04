"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
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
import { Loader2, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { TeacherFormData, teacherSchema } from "@/lib/validator/zodValidation";
import { useUploadThing } from "@/lib/uploadthing";
import { trpc } from "@/app/_trpc/client";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";

interface TeacherCreationDialogProps {
  openFromEdit?: boolean;
  setOpenFromEdit?: (open: boolean) => void;
  teacherId?: string;
  teacherInfo?: TeacherFormData;
}
const TeacherCreationDialog = ({
  openFromEdit,
  setOpenFromEdit,
  teacherId,
  teacherInfo,
}: TeacherCreationDialogProps) => {
  const utils = trpc.useUtils();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const isOpen = openFromEdit !== undefined ? openFromEdit : open;
  const setIsOpen = setOpenFromEdit !== undefined ? setOpenFromEdit : setOpen;
  const { startUpload } = useUploadThing("imageUploader");
  const { data: teacherData } = trpc.getTeachers.useQuery();
  const createTeacher = trpc.createUserWithTeacher.useMutation({
    onSuccess: (data) => {
      setIsLoading(false);
      utils.getTeachers.invalidate();
      setOpen(false);
      toast.success(data.message);
    },
  });
  const editTeacher = trpc.editTeacher.useMutation({
    onSuccess: (data) => {
      setIsLoading(false);
      utils.getTeachers.invalidate();
      setOpen(false);
      setOpenFromEdit && setOpenFromEdit(false);
      toast.success(data.message);
    },
    onError: (error) => {
      setIsLoading(false);
      console.error("Error editing teacher:", error);
      if (error instanceof TRPCClientError) {
        toast.error(error.message);
      }
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
  });

  useEffect(() => {
    if (teacherData && teacherData.length > 0 && !teacherInfo) {
      const lastteacherId = teacherData[teacherData.length - 1].rollNumber;
      setValue("teacherId", String(Number(lastteacherId) + 1));
    } else {
      setValue("teacherId", "1");
    }

    if (teacherInfo) {
      setValue("teacherId", teacherInfo.teacherId);
      setValue("teacherName", teacherInfo.teacherName);
      setValue("teacherEmail", teacherInfo.teacherEmail);
      setValue("teacherPassword", teacherInfo.teacherPassword);
    }
  }, [teacherData, teacherInfo, setValue]);

  const onSubmit = async (data: TeacherFormData) => {
    setIsLoading(true);
    try {
      let uploadImageUrl = teacherInfo?.teacherImage || null;
      const file =
        data.teacherImage instanceof FileList && data.teacherImage.length > 0
          ? data.teacherImage[0]
          : null;
      if (file) {
        const res = await startUpload([file]);
        if (res && res[0]) {
          uploadImageUrl = res[0].ufsUrl;
        }
      }
      const updatedTeacher = {
        ...data,
        teacherImage: uploadImageUrl,
      };
      if (teacherInfo) {
        await editTeacher.mutateAsync({
          id: teacherId!,
          teacherSchema: updatedTeacher,
        });
      } else {
        await createTeacher.mutateAsync(updatedTeacher);
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error creating group:", error);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!teacherInfo && (
        <DialogTrigger asChild>
          <Button>
            Enroll Teacher <Plus />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enroll Teacher</DialogTitle>
          <DialogDescription>
            Enroll a teacher. Click create when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="teacher-id" className="w-full">
                ID
              </Label>
              <Input
                id="teacher-id"
                {...register("teacherId")}
                className={cn("w-full", {
                  "border-destructive focus-visible:ring-destructive":
                    errors.teacherId,
                  "border-input focus-visible:ring-ring": !errors.teacherId,
                })}
                readOnly
              />
              {errors.teacherId && (
                <p className="text-red-500 text-sm">
                  {errors.teacherId.message?.toString()}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="teacher-name" className="w-full">
                Name
              </Label>
              <Input
                id="teacher-name"
                {...register("teacherName")}
                className="w-full"
                onChange={(e) => setValue("teacherName", e.target.value)}
              />
              {errors.teacherName && (
                <p className="text-red-500 text-sm">
                  {errors.teacherName.message?.toString()}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="teacher-email" className="w-full">
                Email
              </Label>
              <Input
                id="teacher-email"
                {...register("teacherEmail")}
                className="w-full"
                onChange={(e) => setValue("teacherEmail", e.target.value)}
              />
              {errors.teacherEmail && (
                <p className="text-red-500 text-sm">
                  {errors.teacherEmail.message?.toString()}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="teacher-password" className="w-full">
                Password
              </Label>
              <Input
                id="teacher-password"
                {...register("teacherPassword")}
                className="w-full"
                onChange={(e) => setValue("teacherPassword", e.target.value)}
              />
              {errors.teacherPassword && (
                <p className="text-red-500 text-sm">
                  {errors.teacherPassword.message?.toString()}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="teacher-img" className="w-full">
                Select Image
              </Label>
              <Input
                type="file"
                id="teacher-image"
                {...register("teacherImage")}
                className="w-full"
              />
              {errors.teacherImage && (
                <p className="text-red-500 text-sm">
                  {errors.teacherImage.message?.toString()}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button disabled={isLoading} type="submit">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {teacherInfo ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherCreationDialog;
