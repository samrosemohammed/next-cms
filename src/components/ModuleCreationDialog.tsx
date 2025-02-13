"use client";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ModuleFormData, moduleSchema } from "@/lib/validator/moduleSchema";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/app/_trpc/client";
import { useState } from "react";

export const ModuleCreationDialog = () => {
  const utils = trpc.useUtils();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
  });
  const [open, setOpen] = useState<boolean>(false);
  const createModule = trpc.createModule.useMutation({
    onSuccess: (data) => {
      console.log("data: ", data);
      utils.getModules.invalidate();
      setOpen(false);
    },
    onError: (error) => {
      console.log("error: ", error.message);
    },
  });
  const onSubmit = async (data: ModuleFormData) => {
    try {
      await createModule.mutateAsync(data);
      console.log("data: ", data);
    } catch (error) {
      console.error("Error creating module:", error);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          Create Module <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Module Creation</DialogTitle>
          <DialogDescription>
            Add a module. Click create when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="module-name" className="w-full">
                Name
              </Label>
              <Input
                id="module-name"
                {...register("name")}
                className={cn("w-full", {
                  "border-destructive focus-visible:ring-destructive":
                    errors.name,
                  "border-input focus-visible:ring-ring": !errors.name,
                })}
                onChange={(e) => setValue("name", e.target.value)}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">
                  {errors.name.message?.toString()}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="module-code" className="w-full">
                Code
              </Label>
              <Input
                id="module-code"
                {...register("code")}
                className="w-full"
                onChange={(e) => setValue("code", e.target.value)}
              />
              {errors.code && (
                <p className="text-red-500 text-sm">
                  {errors.code.message?.toString()}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="module-start-date" className="w-full">
                Start Date
              </Label>
              <Input
                id="module-start-date"
                {...register("startDate")}
                className="w-full"
                onChange={(e) => setValue("startDate", e.target.value)}
              />
              {errors.startDate && (
                <p className="text-red-500 text-sm">
                  {errors.startDate.message?.toString()}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="module-end-date" className="w-full">
                End Date
              </Label>
              <Input
                id="module-end-date"
                {...register("endDate")}
                className="w-full"
                onChange={(e) => setValue("endDate", e.target.value)}
              />
              {errors.endDate && (
                <p className="text-red-500 text-sm">
                  {errors.endDate.message?.toString()}
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
