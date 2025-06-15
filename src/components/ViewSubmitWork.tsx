"use client";
import { trpc } from "@/app/_trpc/client";
import { Button, buttonVariants } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { formatDate } from "@/lib/formatDate";
import Link from "next/link";
import { File, Link2 } from "lucide-react";
import { Loader } from "./Loader";
import { Empty } from "./Empty";

interface ViewSubmitWorkProps {
  assignmentId?: string;
}

const ViewSubmitWork = ({ assignmentId }: ViewSubmitWorkProps) => {
  const { data: viewSubmitWork, isLoading: isViewSubmitWorkLoading } =
    trpc.getViewSubmitWork.useQuery({
      id: assignmentId!,
    });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">View Submit Work</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] md:max-w-screen-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>View Submitted Work</DialogTitle>
          <DialogDescription>
            Below is your submitted work associated file and link. Click on it
            for more details.
          </DialogDescription>
        </DialogHeader>
        {isViewSubmitWorkLoading ? (
          <Loader />
        ) : viewSubmitWork ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table>
                <TableCaption>Submitted work by you.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module Name</TableHead>
                    <TableHead>Assignment Title</TableHead>
                    <TableHead>Submitted File</TableHead>
                    <TableHead>Submitted Link</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Submitted On</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      {viewSubmitWork?.moduleObjectId?.name
                        ? viewSubmitWork?.moduleObjectId?.name
                        : "----"}
                    </TableCell>
                    <TableCell>
                      {viewSubmitWork?.assignmentObjectId?.title
                        ? viewSubmitWork?.assignmentObjectId?.title
                        : "----"}
                    </TableCell>
                    <TableCell>
                      {viewSubmitWork?.files
                        ? viewSubmitWork?.files?.map((f) => (
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
                          ))
                        : "----"}
                    </TableCell>
                    <TableCell>
                      {viewSubmitWork?.links
                        ? viewSubmitWork?.links?.map((link) => (
                            <Link
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`truncate p-2 ${buttonVariants({
                                variant: "outline",
                              })}`}
                              href={link}
                              key={link}
                            >
                              <Link2 className="w-4 h-4" />
                              {link}
                            </Link>
                          ))
                        : "----"}
                    </TableCell>
                    <TableCell>
                      {viewSubmitWork?.assignmentObjectId?.dueDate
                        ? formatDate(viewSubmitWork.assignmentObjectId.dueDate)
                        : "----"}
                    </TableCell>
                    <TableCell>
                      {viewSubmitWork?.createdAt
                        ? formatDate(viewSubmitWork.createdAt)
                        : "----"}
                    </TableCell>
                    <TableCell>
                      {viewSubmitWork?.status ? (
                        <span
                          className={`${
                            viewSubmitWork?.status === "Late"
                              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              : "bg-primary text-primary-foreground hover:bg-primary/90"
                          } shadow px-2 py-1 rounded`}
                        >
                          {viewSubmitWork?.status}
                        </span>
                      ) : (
                        "----"
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Assignment Details</h3>
                  {viewSubmitWork?.status && (
                    <span
                      className={`${
                        viewSubmitWork?.status === "Late"
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-primary text-primary-foreground"
                      } shadow px-2 py-1 rounded text-sm`}
                    >
                      {viewSubmitWork?.status}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Module Name:
                    </span>
                    <p className="text-sm">
                      {viewSubmitWork?.moduleObjectId?.name || "----"}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Assignment Title:
                    </span>
                    <p className="text-sm">
                      {viewSubmitWork?.assignmentObjectId?.title || "----"}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Due Date:
                    </span>
                    <p className="text-sm">
                      {viewSubmitWork?.assignmentObjectId?.dueDate
                        ? formatDate(viewSubmitWork.assignmentObjectId.dueDate)
                        : "----"}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Submitted On:
                    </span>
                    <p className="text-sm">
                      {viewSubmitWork?.createdAt
                        ? formatDate(viewSubmitWork.createdAt)
                        : "----"}
                    </p>
                  </div>
                </div>

                {viewSubmitWork?.files && viewSubmitWork.files.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground mb-2 block">
                      Submitted Files:
                    </span>
                    <div className="space-y-2">
                      {viewSubmitWork.files.map((f) => (
                        <Link
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 p-2 text-sm ${buttonVariants(
                            {
                              variant: "outline",
                              size: "sm",
                            }
                          )}`}
                          href={f.url}
                          key={f.key}
                        >
                          <File className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{f.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {viewSubmitWork?.links && viewSubmitWork.links.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground mb-2 block">
                      Submitted Links:
                    </span>
                    <div className="space-y-2">
                      {viewSubmitWork.links.map((link) => (
                        <Link
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 p-2 text-sm w-full ${buttonVariants(
                            {
                              variant: "outline",
                              size: "sm",
                            }
                          )}`}
                          href={link}
                          key={link}
                        >
                          <Link2 className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{link}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Submitted work by you.
              </p>
            </div>
          </>
        ) : (
          <Empty des="You haven't submitted assignment yet. Please check back later." />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewSubmitWork;
