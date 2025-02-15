"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AssignModuleFormData,
  assignModuleSchema,
} from "@/lib/validator/zodValidation";
import { trpc } from "@/app/_trpc/client";

interface ModuleAssignDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}
export const ModuleAssignDialog = ({
  open,
  setOpen,
}: ModuleAssignDialogProps) => {
  const { data: groupData } = trpc.getGroups.useQuery();
  const { data: teacherData } = trpc.getTeachers.useQuery();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<AssignModuleFormData>({
    resolver: zodResolver(assignModuleSchema),
  });
  const onSubmit = async (data: AssignModuleFormData) => {
    console.log("data", data);
  };
  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      reset(); // Reset the form when the dialog is closed
    }
  };
  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Module</DialogTitle>
          <DialogDescription>
            Assign module to group and teacher. Click assign when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <div className="space-y-1">
              <Label htmlFor="teacher-name-assign" className="w-full">
                Teacher
              </Label>
              <Select onValueChange={(value) => setValue("teacher", value)}>
                <SelectTrigger className="">
                  <SelectValue placeholder="Select a Teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Teacher</SelectLabel>
                    {teacherData?.map((teacher) => (
                      <SelectItem key={teacher._id} value={teacher._id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.teacher && (
                <p className="text-red-500 text-sm">
                  {errors.teacher.message?.toString()}
                </p>
              )}
            </div>
          </div>
          <div className="py-4">
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
          </div>
          <DialogFooter>
            <Button type="submit">Assign</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
