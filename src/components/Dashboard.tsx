"use client";
import { trpc } from "@/app/_trpc/client";

export const Dashboard = () => {
  const { data } = trpc.getTodos.useQuery();
  return <div>{JSON.stringify(data)}</div>;
};
