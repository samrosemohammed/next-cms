"use client";
import React, { useState } from "react";
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
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { TeacherFormData, teacherSchema } from "@/lib/validator/teacherSchema";

const TeacherCreationDialog = () => {
  const [open, setOpen] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
  });
  const onSubmit = async (data: any) => {
    try {
      //   await createGroup.mutateAsync(data);
      console.log("data: ", data);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          Enroll Teacher <Plus />
        </Button>
      </DialogTrigger>
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
                onChange={(e) => setValue("teacherId", e.target.value)}
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
              <Label htmlFor="group-name" className="w-full">
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
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherCreationDialog;
