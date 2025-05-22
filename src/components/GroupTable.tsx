"use client";
import React, { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { trpc } from "@/app/_trpc/client";
import { toast } from "sonner";
import GroupCreationDialog from "./GroupCreationDialog";
import { GroupFormData } from "@/lib/validator/zodValidation";
import { Loader } from "./Loader";
import { Empty } from "./Empty";

export const GroupTable = () => {
  const [isEditGroupOpen, setIsEditGroupOpen] = useState<boolean>(false);
  const [selectedGroupInfo, setSelectedGroupInfo] = useState<GroupFormData>();
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const utils = trpc.useUtils();
  const { data, isLoading: isGroupLoading } = trpc.getGroups.useQuery();
  const deleteGroup = trpc.deleteGroup.useMutation({
    onSuccess: (data) => {
      utils.getGroups.invalidate();
      toast.success(data.message);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const handleDelete = (id: string) => {
    try {
      deleteGroup.mutate({ id });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      {isGroupLoading ? (
        <Loader />
      ) : data?.length ? (
        <Table>
          <TableCaption>A list of your recent group created.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">SN</TableHead>
              {/* <TableHead className="w-[100px]">Group ID</TableHead> */}
              <TableHead>Group Name</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((g, i) => (
              <TableRow key={g._id}>
                <TableCell className="font-medium">{i + 1}</TableCell>
                {/* <TableCell className="font-medium">{g.groupId}</TableCell> */}
                <TableCell>{g.groupName}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    className={buttonVariants({
                      size: "sm",
                      variant: "edit",
                    })}
                    onClick={() => {
                      setSelectedGroupId(g._id);
                      setSelectedGroupInfo({
                        groupId: g.groupId,
                        groupName: g.groupName,
                      });
                      setIsEditGroupOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size={"sm"}
                        variant={"destructive"}
                        className="outline-none"
                      >
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your group information and remove your data
                          from our servers.
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
                          onClick={() => handleDelete(g._id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Empty des="No group found. Please enroll a group." />
      )}

      {isEditGroupOpen && (
        <GroupCreationDialog
          groupId={selectedGroupId}
          openFromEdit={isEditGroupOpen}
          setOpenFromEdit={setIsEditGroupOpen}
          groupInfo={selectedGroupInfo}
        />
      )}
    </div>
  );
};
