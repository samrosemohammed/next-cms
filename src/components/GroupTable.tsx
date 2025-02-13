"use client";
import React from "react";
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
import { trpc } from "@/app/_trpc/client";

export const GroupTable = () => {
  const { data } = trpc.getGroups.useQuery();

  return (
    <Table>
      <TableCaption>A list of your recent group created.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Group ID</TableHead>
          <TableHead>Group Name</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((g) => (
          <TableRow key={g._id}>
            <TableCell className="font-medium">{g.groupId}</TableCell>
            <TableCell>{g.groupName}</TableCell>
            <TableCell className="text-right space-x-2">
              <Button
                className={buttonVariants({
                  size: "sm",
                  variant: "edit",
                })}
              >
                Edit
              </Button>
              <Button
                className={buttonVariants({
                  size: "sm",
                  variant: "destructive",
                })}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
