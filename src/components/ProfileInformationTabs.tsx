"use client";
import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { useForm } from "react-hook-form";
import { ProfileFormData, profileSchema } from "@/lib/validator/zodValidation";
import { User } from "next-auth";
import { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { useDropzone } from "@uploadthing/react";
import { toast } from "sonner";
import { trpc } from "@/app/_trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ProfileInformationTabsProps {
  user: User;
}
export const ProfileInformationTabs = ({
  user,
}: ProfileInformationTabsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const utils = trpc.useUtils();
  const { data: userData } = trpc.getUserData.useQuery();
  const updateProfile = trpc.updateProfile.useMutation({
    onSuccess: (data) => {
      setIsLoading(false);
      utils.getUserData.invalidate();
      toast.success(data.message);
    },
    onError: (error) => {
      setIsLoading(false);
      toast.error(error.message || "Failed to update profile");
    },
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(
    userData?.image || null
  );

  const [imageFile, setImageFile] = useState<File | null>(null);
  const { startUpload } = useUploadThing("imageUploader");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // dropzone
  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImageFile(file);
      setSelectedImage(URL.createObjectURL(file));
    }
  };
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
  });
  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    let uploadedImage = null;
    // Check if an image file is provided and upload it
    if (imageFile) {
      const fileUploads = await startUpload([imageFile]);
      if (!fileUploads) {
        setIsLoading(false);
        toast.error("Image upload failed");
        return;
      }
      uploadedImage = {
        name: fileUploads[0].name,
        url: fileUploads[0].ufsUrl,
        key: fileUploads[0].key,
      };
    }

    // Prepare the payload
    const payload = {
      ...data,
      bio: data.bio || "", // Default to an empty string if not provided
      username: data.username || "", // Default to an empty string if not provided
      image: uploadedImage ? uploadedImage.url : selectedImage, // Use uploaded image URL or existing image
    };

    try {
      // Call the API to update the profile
      await updateProfile.mutateAsync(payload);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Update form values when userData is fetched
  useEffect(() => {
    if (userData) {
      reset({
        name: userData.name || "",
        email: userData.email || "",
        image: userData.image || "",
        bio: userData.bio || "",
        username: userData.username || "",
      });
      setSelectedImage(userData.image || null);
    }
  }, [userData, reset]);
  return (
    <TabsContent value="profile" className="space-y-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your profile information and how others see you on the
            platform.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div
                {...getRootProps()}
                className="flex flex-col items-center gap-2 cursor-pointer"
              >
                <input {...getInputProps()} />
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={selectedImage || undefined}
                    alt="Avatar"
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <p className="text-xs text-muted-foreground">Size : 4MB</p>
                <Button variant="outline" size="sm" type="button">
                  Change Avatar
                </Button>
              </div>

              <div className="grid gap-4 flex-1">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Name" {...register("name")} />
                  {errors.name && (
                    <p className="text-red-500 text-sm">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@company.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Tell us about yourself"
                    {...register("bio")}
                  />
                  {errors.bio && (
                    <p className="text-red-500 text-sm">{errors.bio.message}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div>
                <div className="flex items-center gap-2">
                  <Input
                    id="username"
                    placeholder="Username"
                    {...register("username")}
                  />
                  {/* <Badge variant="outline" className="text-xs">
                    Public
                  </Badge> */}
                </div>
                {errors.username && (
                  <p className="text-red-500 text-sm">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                This is your public display name. It can be your real name or a
                pseudonym.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              onClick={() => {
                reset(); // Reset form fields
                setSelectedImage(userData?.image || null); // Reset the selected image to the original image
                setImageFile(null); // Clear the selected file
              }}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isLoading} type="submit">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>
    </TabsContent>
  );
};
