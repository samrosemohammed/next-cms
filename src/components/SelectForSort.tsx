"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/app/_trpc/client";
import { useParams } from "next/navigation";

const SelectForSort = () => {
  const { moduleId } = useParams() as { moduleId: string };
  const { data } = trpc.getResourceFile.useQuery({ moduleId });

  return (
    <Select onValueChange={(value) => ""}>
      <SelectTrigger className="">
        <SelectValue placeholder="Sort with Group" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Group</SelectLabel>
          {data?.map((d) => (
            <SelectItem
              key={d.groupObjectId?._id}
              value={d.groupObjectId?._id!}
            >
              {d.groupObjectId?.groupName}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SelectForSort;
