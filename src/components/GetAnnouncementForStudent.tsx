"use client";
import { trpc } from "@/app/_trpc/client";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { File, Link2, MessageSquare } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { formatDate } from "@/lib/formatDate";
import { Loader } from "./Loader";
import { Empty } from "./Empty";

interface GetAnnouncementForStudentProps {
  userId?: string;
}
export const GetAnnouncementForStudent =
  ({}: GetAnnouncementForStudentProps) => {
    const { moduleId } = useParams() as { moduleId: string };
    const { data: announcement, isLoading: isAnnouncementLoading } =
      trpc.getAnnounceForStudent.useQuery({
        moduleId,
      });
    return (
      <div>
        {isAnnouncementLoading ? (
          <Loader />
        ) : announcement?.length ? (
          <div className="p-4">
            {announcement?.map((announcement) => {
              return (
                <Card className="mb-4" key={announcement._id}>
                  <CardHeader>
                    <CardTitle className="mb-4">
                      <div className="flex justify-between items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <div className="flex items-center gap-2">
                          <span className="p-1 text-xs rounded bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80">
                            Group {announcement.groupObjectId?.groupName}
                          </span>
                          <p className="text-sm text-zinc-600">
                            {formatDate(announcement.createdAt)}
                          </p>
                        </div>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {announcement.description}
                    </CardDescription>
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
              );
            })}
          </div>
        ) : (
          <Empty des="No module announcement addeded currently. Please check back later." />
        )}
      </div>
    );
  };
