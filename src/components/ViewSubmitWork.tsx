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
      <DialogContent className="md:max-w-screen-xl">
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
        ) : (
          <Empty des="You haven't submitted assignment yet. Please check back later." />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewSubmitWork;
