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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/button";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StudentFormData, studentSchema } from "@/lib/validator/zodValidation";
import { useUploadThing } from "@/lib/uploadthing";
import { trpc } from "@/app/_trpc/client";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";

interface StudentCreationDialogProps {
  openFromEdit?: boolean;
  setOpenFromEdit?: (open: boolean) => void;
  studentId?: string;
  studentInfo?: StudentFormData;
}

export const StudentCreationDialog = ({
  openFromEdit,
  setOpenFromEdit,
  studentId,
  studentInfo,
}: StudentCreationDialogProps) => {
  const utils = trpc.useUtils();
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isOpen = openFromEdit !== undefined ? openFromEdit : open;
  const setIsOpen = setOpenFromEdit !== undefined ? setOpenFromEdit : setOpen;
  const { startUpload } = useUploadThing("imageUploader");
  const { data: groupData } = trpc.getGroups.useQuery();
  const { data: studentData } = trpc.getStudents.useQuery();
  const createStudent = trpc.createUserWithStudent.useMutation({
    onSuccess: () => {
      setIsLoading(false);
      utils.getStudents.invalidate();
      setOpen(false);
      setIsLoading(false);
    },
  });

  const editStudent = trpc.editStudent.useMutation({
    onSuccess: (data) => {
      setIsLoading(false);
      utils.getStudents.invalidate();
      setOpen(false);
      if (setOpenFromEdit) setOpenFromEdit(false);
      toast.success(data.message);
      setIsLoading(false);
    },
    onError: (err) => {
      setIsLoading(false);
      console.error("Error editing student:", err);
      if (err instanceof TRPCClientError) {
        toast.error(err.message);
      }
      setIsLoading(false);
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  useEffect(() => {
    if (studentData && studentData.length > 0) {
      const lastStudentId = studentData[studentData.length - 1].rollNumber;
      setValue("studentId", String(Number(lastStudentId) + 1));
    } else {
      setValue("studentId", "1");
    }

    if (studentInfo) {
      setValue("studentId", studentInfo.studentId);
      setValue("studentName", studentInfo.studentName);
      setValue("studentEmail", studentInfo.studentEmail);
      setValue("studentPassword", studentInfo.studentPassword);
    }
  }, [studentData, studentInfo, setValue]);

  const onSubmit = async (data: StudentFormData) => {
    setIsLoading(true);
    try {
      let uploadImageUrl = studentInfo?.studentImage || null;
      const file =
        data.studentImage instanceof FileList && data.studentImage.length > 0
          ? data.studentImage[0]
          : null;
      if (file) {
        const res = await startUpload([file]);
        if (res && res[0]) {
          uploadImageUrl = res[0].ufsUrl;
        }
      }
      const updatedStudent = {
        ...data,
        studentImage: uploadImageUrl,
      };
      if (!studentInfo) {
        await createStudent.mutateAsync(updatedStudent);
      } else {
        await editStudent.mutateAsync({
          id: studentId!,
          studentSchema: updatedStudent,
        });
      }
    } catch (err) {
      console.error("Error creating student:", err);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!studentInfo && (
        <DialogTrigger asChild>
          <Button>
            {studentInfo ? "Edit Student" : "Enroll Student"} <Plus />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {studentInfo ? "Edit Student" : "Enroll Student"}
          </DialogTitle>
          <DialogDescription>
            {studentInfo
              ? "Edit a student. Click save when you're done"
              : "Enroll a student. Click create when you're done."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* <div className="space-y-1">
              <Label htmlFor="student-id" className="w-full">
                ID
              </Label>
              <Input
                id="student-id"
                {...register("studentId")}
                className={cn("w-full", {
                  "border-destructive focus-visible:ring-destructive":
                    errors.studentId,
                  "border-input focus-visible:ring-ring": !errors.studentId,
                })}
                readOnly
                disabled
              />
              {errors.studentId && (
                <p className="text-red-500 text-sm">
                  {errors.studentId.message?.toString()}
                </p>
              )}
            </div> */}
            <div className="space-y-1">
              <Label htmlFor="student-name" className="w-full">
                Name
              </Label>
              <Input
                id="student-name"
                {...register("studentName")}
                className="w-full"
                autoFocus
                onChange={(e) => setValue("studentName", e.target.value)}
              />
              {errors.studentName && (
                <p className="text-red-500 text-sm">
                  {errors.studentName.message?.toString()}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="student-email" className="w-full">
                Email
              </Label>
              <Input
                id="student-email"
                {...register("studentEmail")}
                className="w-full"
                onChange={(e) => setValue("studentEmail", e.target.value)}
              />
              {errors.studentEmail && (
                <p className="text-red-500 text-sm">
                  {errors.studentEmail.message?.toString()}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="student-password" className="w-full">
                Password
              </Label>
              <Input
                id="student-password"
                {...register("studentPassword")}
                className="w-full"
                onChange={(e) => setValue("studentPassword", e.target.value)}
              />
              {errors.studentPassword && (
                <p className="text-red-500 text-sm">
                  {errors.studentPassword.message?.toString()}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="student-group" className="w-full">
                Group
              </Label>
              <Select
                onValueChange={(value) => setValue("studentGroup", value)}
              >
                <SelectTrigger className="">
                  <SelectValue placeholder="Select a Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Group</SelectLabel>
                    {groupData?.map((group) => (
                      <SelectItem key={group._id} value={group._id}>
                        {group.groupName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.studentGroup && (
                <p className="text-red-500 text-sm">
                  {errors.studentGroup.message?.toString()}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="student-img" className="w-full">
                Select Image
              </Label>
              <Input
                type="file"
                id="student-image"
                {...register("studentImage")}
                className="w-full"
              />
              {errors.studentImage && (
                <p className="text-red-500 text-sm">
                  {errors.studentImage.message?.toString()}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button disabled={isLoading} type="submit">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {studentInfo ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
