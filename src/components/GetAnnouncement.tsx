"use client";
import { trpc } from "@/app/_trpc/client";
import { AnnouncementFormData } from "@/lib/validator/zodValidation";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  EllipsisVertical,
  File,
  Link2,
  MessageSquare,
  Pencil,
  Trash,
} from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { toast } from "sonner";
import { AnnouncementCreationDialog } from "./AnnouncementCreationDialog";
import { Loader } from "./Loader";
import { Empty } from "./Empty";

export const GetAnnouncement = () => {
  const utils = trpc.useUtils();
  const { moduleId } = useParams() as { moduleId: string };
  const { data, isLoading: isAnnouncementLoading } =
    trpc.getAnnouncement.useQuery({ moduleId });
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
    <div>
      {isAnnouncementLoading ? (
        <Loader />
      ) : data?.length ? (
        <div className="px-2 sm:px-4 py-2">
          {data?.map((announcement) => (
            <Card className="mb-4" key={announcement._id}>
              <CardHeader>
                <CardTitle className="mb-4">
                  <div className="flex items-center justify-between">
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
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
                                groupId: announcement.groupObjectId?._id ?? "",
                                moduleId:
                                  announcement.moduleObjectId?._id ?? "",
                                teacherId:
                                  announcement.teacherObjectId?._id ?? "",
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
                <CardDescription>{announcement.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
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
            <AlertDialogContent className="max-w-[350px] sm:max-w-[425px]">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your announcement information and remove your data from our
                  servers.
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
      ) : (
        <Empty des="No Announcement found. Please create an announcment" />
      )}
    </div>
  );
};
