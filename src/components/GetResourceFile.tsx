"use client";
import { trpc } from "@/app/_trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useParams } from "next/navigation";
import { Bookmark, EllipsisVertical, File, Link2 } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/formatDate";
import { buttonVariants } from "./ui/button";

export const GetResourceFile = () => {
  const { moduleId } = useParams() as { moduleId: string };
  const { data } = trpc.getResourceFile.useQuery({ moduleId });
  return (
    <div className="p-4">
      {data?.map((file) => (
        <Card className="mb-4" key={file._id}>
          <CardHeader>
            <CardTitle>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <File className="w-4 h-4" />
                  {file.title}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-zinc-600">
                    {formatDate(file.createdAt)}
                  </p>
                  <EllipsisVertical className="cursor-pointer" />
                </div>
              </div>
              <CardDescription className="mt-2">
                {file.description}
              </CardDescription>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 space-x-2">
            {file.files &&
              file.files.map((f) => (
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 ${buttonVariants({
                    variant: "outline",
                  })}`}
                  href={f.url}
                  key={f.key}
                >
                  <File className="w-4 h-4" />
                  {f.name}
                </Link>
              ))}
            {file.links &&
              file.links.map((l, i) => (
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
    </div>
  );
};
