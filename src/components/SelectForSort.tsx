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

interface SelectForSortProps {
  onValueChange?: (value: string | null) => void;
}

const SelectForSort = ({ onValueChange }: SelectForSortProps) => {
  const { data } = trpc.getAssignModuleForTeacher.useQuery();
  const uniqueGroups = data
    ? Array.from(new Map(data.map((d) => [d.group?._id, d])).values())
    : [];
  return (
    <Select
      onValueChange={(value) => onValueChange?.(value === "all" ? null : value)}
    >
      <SelectTrigger className="">
        <SelectValue placeholder="Sort with Group" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Group</SelectLabel>
          <SelectItem value="all">Default</SelectItem>
          {uniqueGroups?.map((d) => (
            <SelectItem key={d?.group?._id} value={d.group?._id ?? ""}>
              {d.group?.groupName}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SelectForSort;
