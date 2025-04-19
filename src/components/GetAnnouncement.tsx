"use client";
import { trpc } from "@/app/_trpc/client";
import { AnnouncementFormData } from "@/lib/validator/zodValidation";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { EllipsisVertical, File, Link2, Pencil, Trash } from "lucide-react";
import { formatDate } from "@/lib/formatDate";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { buttonVariants } from "./ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { toast } from "sonner";
import { AnnouncementCreationDialog } from "./AnnouncementCreationDialog";

export const GetAnnouncement = () => {
  const utils = trpc.useUtils();
  const { moduleId } = useParams() as { moduleId: string };
  const { data } = trpc.getAnnouncement.useQuery({ moduleId });
  console.log("announcement data: ", data);
  const [selectedAnnouncementId, setSelectedAnnouncementId] =
    useState<string>("");
  const [isDeleteAleartOpen, setIsDeleteAleartOpen] = useState<boolean>(false);
  const [isEditAnnouncementOpen, setIsEditAnnouncementOpen] =
    useState<boolean>(false);
  const [selectedAnnouncementInfo, setSelectedAnnouncementInfo] =
    useState<AnnouncementFormData>();
  const deleteAnnouncement = trpc.deleteAnnouncement.useMutation({
    onSuccess: (data) => {
      utils.getAnnouncement.invalidate();
      setIsDeleteAleartOpen(false);
      toast.success(data.message);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const handleDelete = async (announcementId: string) => {
    deleteAnnouncement.mutate({ id: announcementId });
  };
  return (
    <div className="p-4">
      {data?.map((announcement) => (
        <Card className="mb-4" key={announcement._id}>
          <CardHeader>
            <CardTitle>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <File className="w-4 h-4" />
                  {announcement.description}
                </div>
                <div className="flex items-center gap-2">
                  <span className="p-1 text-xs rounded bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80">
                    Group {announcement.groupObjectId?.groupName}
                  </span>
                  <p className="text-sm text-zinc-600">
                    {formatDate(announcement.createdAt)}
                  </p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <EllipsisVertical className="cursor-pointer" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedAnnouncementInfo({
                            description: announcement?.description,
                            files: announcement.files,
                            links: announcement.links,
                            groupId: announcement.groupObjectId?._id!,
                            moduleId: announcement.moduleObjectId?._id!,
                            teacherId: announcement.teacherObjectId?._id!,
                          });
                          setIsEditAnnouncementOpen(true);
                          setSelectedAnnouncementId(announcement._id);
                        }}
                      >
                        <Pencil /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedAnnouncementId(announcement._id);
                          setIsDeleteAleartOpen(true);
                        }}
                      >
                        <Trash /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 space-x-2">
            {announcement.files &&
              announcement.files.map((f) => (
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 ${buttonVariants({
                    variant: "outline",
                  })}`}
                  href={f.url}
                  key={f.key}
                >
                  {" "}
                  <File className="w-4 h-4" />
                  {f.name}
                </Link>
              ))}
            {announcement.links &&
              announcement.links.map((l, i) => (
                <Link
                  key={i}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={l}
                  className={`${buttonVariants({
                    variant: "outline",
                  })}`}
                >
                  <Link2 className="w-4 h-4" />
                  {"Link " + (i + 1)}
                </Link>
              ))}
          </CardContent>
        </Card>
      ))}
      {/* for file deletion */}
      <AlertDialog
        open={isDeleteAleartOpen}
        onOpenChange={setIsDeleteAleartOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              announcement information and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className={buttonVariants({
                size: "sm",
                variant: "ghost",
              })}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({
                size: "sm",
                variant: "destructive",
              })}
              onClick={() => handleDelete(selectedAnnouncementId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* for edit announcement */}
      {isEditAnnouncementOpen && (
        <AnnouncementCreationDialog
          openFromEdit={isEditAnnouncementOpen}
          setOpenFromEdit={setIsEditAnnouncementOpen}
          announcementId={selectedAnnouncementId}
          announcementInfo={selectedAnnouncementInfo}
          userId={selectedAnnouncementInfo?.teacherId}
        />
      )}
    </div>
  );
};
