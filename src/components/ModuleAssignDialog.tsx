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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";
import { Loader2 } from "lucide-react";

interface ModuleAssignDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  moduleId?: string;
  assignModuleInfo?: AssignModuleFormData;
  assignModuleId?: string;
}
export const ModuleAssignDialog = ({
  open,
  setOpen,
  moduleId,
  assignModuleInfo,
  assignModuleId,
}: ModuleAssignDialogProps) => {
  const utils = trpc.useUtils();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { data: groupData } = trpc.getGroups.useQuery();
  const { data: teacherData } = trpc.getTeachers.useQuery();
  const createAssignModule = trpc.createAssignModule.useMutation({
    onSuccess: (data) => {
      setIsLoading(false);
      setOpen(false);
      toast.success(data.message);
    },
    onError: (error) => {
      setIsLoading(false);
      if (error instanceof TRPCClientError) {
        toast.error(error.message);
      }
    },
  });
  const editAssignModule = trpc.editAssignModule.useMutation({
    onSuccess: (data) => {
      setIsLoading(false);
      utils.getAssignModules.invalidate();
      setOpen(false);
      toast.success(data.message);
    },
    onError: (error) => {
      setIsLoading(false);
      if (error instanceof TRPCClientError) {
        toast.error(error.message);
      }
    },
  });
  const {
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<AssignModuleFormData>({
    resolver: zodResolver(assignModuleSchema),
  });
  const onSubmit = async (data: AssignModuleFormData) => {
    setIsLoading(true);
    try {
      if (assignModuleInfo) {
        await editAssignModule.mutateAsync({
          id: assignModuleId!,
          assignModuleSchema: data,
        });
      } else {
        await createAssignModule.mutateAsync(data);
      }
    } catch (error) {
      setIsLoading(false);
      console.log("error", error);
    }
  };
  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      reset(); // Reset the form when the dialog is closed
    }
  };

  useEffect(() => {
    if (moduleId) {
      setValue("moduleId", moduleId); // Ensure this matches the schema
    }
    if (assignModuleInfo) {
      setValue("teacher", assignModuleInfo.teacher);
      setValue("group", assignModuleInfo.group);
      setValue("moduleId", assignModuleInfo.moduleId);
    }
  }, [assignModuleInfo, moduleId, setValue]);

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {assignModuleInfo ? "Edit Module Assign" : "Assign Module"}
          </DialogTitle>
          <DialogDescription>
            {assignModuleInfo
              ? "Edit the module assign. Click save when you're done."
              : "Assign module to group and teacher. Click assign when you're done."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <div className="space-y-1">
              <Label htmlFor="teacher-name-assign" className="w-full">
                Teacher
              </Label>
              <Select
                defaultValue={assignModuleInfo?.teacher}
                onValueChange={(value) => setValue("teacher", value)}
              >
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
                defaultValue={assignModuleInfo?.group}
                onValueChange={(value) => setValue("group", value)}
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
              {errors.group && (
                <p className="text-red-500 text-sm">
                  {errors.group.message?.toString()}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button disabled={isLoading} type="submit">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {assignModuleInfo ? "Save" : "Assign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
