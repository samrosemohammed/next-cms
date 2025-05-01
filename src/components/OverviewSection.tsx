"use client";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { trpc } from "@/app/_trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { BookOpen, GraduationCap, Users } from "lucide-react";
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PieChartCompo } from "./PieChartCompo";

export const OverviewSection = () => {
  const { data: count } = trpc.getCountForAdmin.useQuery();
  const { data: moduleStats, isLoading } = trpc.getModuleGroupStats.useQuery();
  const activities = [
    {
      id: 1,
      user: {
        name: "John Smith",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "JS",
      },
      action: "submitted an assignment",
      target: "Advanced Mathematics",
      time: "2 hours ago",
    },
    {
      id: 2,
      user: {
        name: "Emily Johnson",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "EJ",
      },
      action: "created a new course",
      target: "Introduction to Biology",
      time: "4 hours ago",
    },
    {
      id: 3,
      user: {
        name: "Michael Brown",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "MB",
      },
      action: "updated the schedule for",
      target: "Computer Science 101",
      time: "Yesterday",
    },
    {
      id: 4,
      user: {
        name: "Sarah Davis",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "SD",
      },
      action: "marked attendance for",
      target: "English Literature",
      time: "Yesterday",
    },
    {
      id: 5,
      user: {
        name: "Robert Wilson",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "RW",
      },
      action: "added new student to",
      target: "Physics Class",
      time: "2 days ago",
    },
  ];
  // const chartData = [
  //   { month: "Math", A: 50, B: 20, C: 80 },
  //   { month: "Science", A: 305, B: 200, C: 100 },
  //   { month: "Biology", A: 237, B: 120, C: 90 },
  //   { month: "Fyp", A: 73, B: 190, C: 102 },
  //   { month: "ML", A: 209, B: 130 },
  //   { month: "Distributed", A: 214, B: 140, C: 90 },
  // ];

  // const chartConfig = {
  //   A: {
  //     label: "Group A",
  //     color: "#2563eb",
  //   },
  //   B: {
  //     label: "Group B",
  //     color: "#4ade80",
  //   },
  //   C: {
  //     label: "Group C",
  //     color: "#60a5fa",
  //   },
  // } satisfies ChartConfig;

  // Transform data for the chart
  const chartData = moduleStats?.map((module) => {
    const data = { moduleName: module.name };
    module.groups.forEach((group) => {
      data[group.name] = group.studentCount;
    });
    return data;
  });

  // Generate dynamic chart config for groups
  const chartConfig = moduleStats
    ? moduleStats.reduce((config, module) => {
        module.groups.forEach((group, index) => {
          if (group.name && !config[group.name]) {
            config[group.name] = {
              label: group.name,
              color: `hsl(var(--primary) / ${1 - index * 0.1})`, // Generate unique colors 240 10% 3.9%
            };
          }
        });
        return config;
      }, {} as ChartConfig)
    : {}; // Default to an empty object if moduleStats is undefined

  console.log("moduleStats: ", moduleStats);

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 my-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{count?.totalModules}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{count?.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Teachers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{count?.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">+2 new this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{count?.totalGroups}</div>
            <p className="text-xs text-muted-foreground">+2 new this month</p>
          </CardContent>
        </Card>
      </div>
      <p className="font-semibold text-zinc-500 mb-1">Overview</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>
              Total Students in each group per module
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="moduleName"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                {Object.keys(chartConfig || {}).map((groupKey) => (
                  <Bar
                    key={groupKey}
                    dataKey={groupKey}
                    fill={chartConfig[groupKey].color}
                    name={chartConfig[groupKey].label}
                    radius={4}
                  />
                ))}
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <PieChartCompo />
      </div>
    </div>
  );
};
