"use client";
import { trpc } from "@/app/_trpc/client";
import { useParams } from "next/navigation";
import React from "react";
export const GetSubmitWorkForTeacher = () => {
  const { moduleId } = useParams() as { moduleId: string };
  const { data: submittedWorkByStudent } =
    trpc.getViewSubmitWorkForTeacher.useQuery({ moduleId });
  console.log(submittedWorkByStudent);
  return <div>hello</div>;
};
