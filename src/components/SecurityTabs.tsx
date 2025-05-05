"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TabsContent } from "./ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChangePasswordFormData,
  changePasswordSchema,
} from "@/lib/validator/zodValidation";
import { trpc } from "@/app/_trpc/client";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";
export const SecurityTabs = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });
  const changePassword = trpc.changePassword.useMutation({
    onSuccess: (data) => {
      setIsLoading(false);
      toast.success(data.message);
      reset();
    },
    onError: (error) => {
      setIsLoading(false);
      toast.error(error.message || "Failed to change password");
    },
  });
  const onSumbit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    console.log(data);
    changePassword.mutateAsync(data);
  };
  return (
    <TabsContent value="security" className="space-y-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password and manage your account security.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSumbit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                {...register("currentPassword")}
                id="current-password"
                type="password"
              />
              {errors.currentPassword && (
                <p className="text-destructive text-sm">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                {...register("newPassword")}
                id="new-password"
                type="password"
              />
              {errors.newPassword && (
                <p className="text-destructive text-sm">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                {...register("confirmPassword")}
                id="confirm-password"
                type="password"
              />
              {errors.confirmPassword && (
                <p className="text-destructive text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button onClick={() => reset()} variant="outline">
              Cancel
            </Button>
            <Button disabled={isLoading} type="submit">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Update Password
            </Button>
          </CardFooter>
        </form>
      </Card>
    </TabsContent>
  );
};
