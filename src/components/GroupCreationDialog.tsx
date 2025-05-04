"use client";
import React, { useEffect, useState } from "react";
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
import { Loader2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { GroupFormData, groupSchema } from "@/lib/validator/zodValidation";
import { trpc } from "@/app/_trpc/client";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";

interface GroupCreationDialogProps {
  openFromEdit?: boolean;
  setOpenFromEdit?: (open: boolean) => void;
  groupInfo?: GroupFormData;
  groupId?: string;
}
const GroupCreationDialog = ({
  openFromEdit,
  setOpenFromEdit,
  groupInfo,
  groupId,
}: GroupCreationDialogProps) => {
  // const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { data: groupData } = trpc.getGroups.useQuery();
  const [open, setOpen] = useState<boolean>(false);
  const isOpen = openFromEdit !== undefined ? openFromEdit : open;
  const setIsOpen = setOpenFromEdit !== undefined ? setOpenFromEdit : setOpen;
  const utils = trpc.useUtils();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
  });
  const createGroup = trpc.createGroup.useMutation({
    onSuccess: (data) => {
      setIsLoading(false);
      console.log("data", data);
      utils.getGroups.invalidate();
      setOpen(false);
      toast.success(data.message);
    },
    onError: (error) => {
      setIsLoading(false);
      console.log("error", error);
      if (error instanceof TRPCClientError) {
        toast.error(error.message);
      }
    },
  });

  const editGroup = trpc.editGroup.useMutation({
    onSuccess: (data) => {
      setIsLoading(false);
      utils.getGroups.invalidate();
      setOpen(false);
      toast.success(data.message);
    },
    onError: (error) => {
      setIsLoading(false);
      console.log("error", error);
      if (error instanceof TRPCClientError) {
        toast.error(error.message);
      }
    },
  });

  useEffect(() => {
    if (groupData && groupData.length > 0 && !groupInfo) {
      const lastGroupId = groupData[groupData.length - 1].groupId;
      setValue("groupId", String(Number(lastGroupId) + 1));
    } else {
      setValue("groupId", "1");
    }
    if (groupInfo) {
      setValue("groupName", groupInfo.groupName);
      setValue("groupId", groupInfo.groupId);
    }
  }, [groupData, groupInfo, setValue]);

  const onSubmit = async (data: GroupFormData) => {
    setIsLoading(true);
    try {
      if (!groupInfo) {
        await createGroup.mutateAsync(data);
      } else {
        if (groupId) {
          await editGroup.mutateAsync({ groupSchema: data, id: groupId });
        } else {
          console.error("groupId is missing");
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error creating group:", error);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!groupInfo && (
        <DialogTrigger asChild>
          <Button>
            Create Group <Plus />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {groupInfo ? "Group Edition" : "Group Creation"}
          </DialogTitle>
          <DialogDescription>
            {groupInfo
              ? "Edit a group: Click save when you're done."
              : "Add a group. Click create when you're done."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="group-id" className="w-full">
                ID
              </Label>
              <Input
                id="group-id"
                {...register("groupId")}
                className={cn("w-full", {
                  "border-destructive focus-visible:ring-destructive":
                    errors.groupId,
                  "border-input focus-visible:ring-ring": !errors.groupId,
                })}
                readOnly
              />
              {errors.groupId && (
                <p className="text-red-500 text-sm">
                  {errors.groupId.message?.toString()}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="group-name" className="w-full">
                Name
              </Label>
              <Input
                id="group-name"
                {...register("groupName")}
                className="w-full"
                onChange={(e) => setValue("groupName", e.target.value)}
              />
              {errors.groupName && (
                <p className="text-red-500 text-sm">
                  {errors.groupName.message?.toString()}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button disabled={isLoading} type="submit">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {groupInfo ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GroupCreationDialog;
