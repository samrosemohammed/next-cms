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
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ModuleFormData, moduleSchema } from "@/lib/validator/zodValidation";
import { Plus } from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";

interface ModuleCreationDialogProps {
  moduleId?: string;
  moduleInfo?: ModuleFormData;
  openFromEdit?: boolean;
  setOpenFromEdit?: (open: boolean) => void;
}
export const ModuleCreationDialog = ({
  moduleId,
  openFromEdit,
  setOpenFromEdit,
  moduleInfo,
}: ModuleCreationDialogProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isOpen = openFromEdit !== undefined ? openFromEdit : open;
  const setIsOpen = setOpenFromEdit !== undefined ? setOpenFromEdit : setOpen;
  const utils = trpc.useUtils();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
  });
  const createModule = trpc.createModule.useMutation({
    onSuccess: (data) => {
      console.log("data: ", data);
      utils.getModules.invalidate();
      setOpen(false);
      toast.success(data.message);
    },
    onError: (error) => {
      console.log("error: ", error.message);
      if (error instanceof TRPCClientError) {
        toast.error(error.message);
      }
    },
  });
  const editModule = trpc.editModule.useMutation({
    onSuccess: (data) => {
      utils.getModules.invalidate();
      setIsOpen(false);
      toast.success(data.message);
    },
    onError: (err) => {
      console.error("Error editing module:", err);
      if (err instanceof TRPCClientError) {
        toast.error(err.message);
      }
    },
  });
  const onSubmit = async (data: ModuleFormData) => {
    try {
      setIsLoading(true);
      if (!moduleInfo) {
        await createModule.mutateAsync(data);
      } else {
        if (moduleId) {
          await editModule.mutateAsync({ moduleSchema: data, id: moduleId });
        } else {
          console.error("Module ID is undefined");
        }
        console.log("edit module");
        console.log("selected module id : ", moduleId);
      }
      console.log("data: ", data);
    } catch (error) {
      setIsLoading(false);
      console.error("Error creating module:", error);
    }
  };
  useEffect(() => {
    if (moduleInfo) {
      setValue("name", moduleInfo.name);
      setValue("code", moduleInfo.code);
      setValue("startDate", moduleInfo.startDate);
      setValue("endDate", moduleInfo.endDate);
    }
  }, [moduleInfo]);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!moduleInfo && (
        <DialogTrigger asChild>
          <Button>
            {moduleInfo ? "Edit Module" : "Create Module"} <Plus />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Module Creation</DialogTitle>
          <DialogDescription>
            {moduleInfo
              ? "Edit the module details. Click save when you're done."
              : "Add a module. Click create when you're done."}
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon />
                    {startDate || moduleInfo?.startDate ? (
                      format(startDate! || moduleInfo?.startDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate!}
                    onSelect={(date) => {
                      if (date) {
                        setStartDate(date);
                        setValue("startDate", date);
                      }
                    }}
                    disabled={(date) => !!endDate && date > endDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon />
                    {endDate || moduleInfo?.endDate ? (
                      format(endDate! || moduleInfo?.endDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate!}
                    onSelect={(date) => {
                      if (date) {
                        setEndDate(date);
                        setValue("endDate", date);
                      }
                    }}
                    disabled={(date) => !!startDate && date < startDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.endDate && (
                <p className="text-red-500 text-sm">
                  {errors.endDate.message?.toString()}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button disabled={isLoading} type="submit">
              {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : null}
              {moduleInfo ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
