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
import { File, Link2 } from "lucide-react";
import { formatDate } from "@/lib/formatDate";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { Loader } from "./Loader";
import { Empty } from "./Empty";

const GetResourceForStudent = () => {
  const { moduleId } = useParams() as { moduleId: string };
  const { data: resource, isLoading: isResourceLoading } =
    trpc.getModuleResourceForStudent.useQuery({
      moduleId,
    });
  return (
    <div>
      {isResourceLoading ? (
        <Loader />
      ) : resource?.length ? (
        <div className="px-2 sm:px-4 py-2">
          {resource?.map((file) => (
            <Card className="mb-4" key={file._id}>
              <CardHeader>
                <CardTitle>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                      <File className="w-4 h-4" />
                      {file.title}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="p-1 text-xs rounded bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80">
                        Group {file.groupObjectId?.groupName}
                      </span>
                      <p className="text text-zinc-600">
                        {formatDate(file.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <CardDescription className="mt-2">
                    {file.description}
                  </CardDescription>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
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
                      <Link2 className="w-4 h-4" /> {"Link " + (i + 1)}
                    </Link>
                  ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Empty des="No module resources added currently. Please check back later." />
      )}
    </div>
  );
};

export default GetResourceForStudent;
