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
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { GroupFormData, groupSchema } from "@/lib/validator/zodValidation";
import { trpc } from "@/app/_trpc/client";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";
const GroupCreationDialog = () => {
  const [open, setOpen] = useState<boolean>(false);
  const { data: groupData } = trpc.getGroups.useQuery();
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
      console.log("data", data);
      utils.getGroups.invalidate();
      setOpen(false);
      toast.success(data.message);
    },
    onError: (error) => {
      console.log("error", error);
      if (error instanceof TRPCClientError) {
        toast.error(error.message);
      }
    },
  });

  useEffect(() => {
    if (groupData && groupData.length > 0) {
      const lastGroupId = groupData[groupData.length - 1].groupId;
      setValue("groupId", String(Number(lastGroupId) + 1));
    } else {
      setValue("groupId", "1");
    }
  }, [groupData, setValue]);
  const onSubmit = async (data: GroupFormData) => {
    try {
      await createGroup.mutateAsync(data);
      console.log("data: ", data);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          Create Group <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Group Creation</DialogTitle>
          <DialogDescription>
            Add a group. Click create when you're done.
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
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GroupCreationDialog;
