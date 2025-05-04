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
import { BookOpen, GraduationCap, Loader2, Users } from "lucide-react";
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PieChartCompo } from "./PieChartCompo";
import { Loader } from "./Loader";

export const OverviewSection = () => {
  const { data: count, isLoading: isCountLoading } =
    trpc.getCountForAdmin.useQuery();
  const { data: moduleStats, isLoading: isModuleStatsLoading } =
    trpc.getModuleGroupStats.useQuery();
  const brandColors = [
    "#4CAF50", // Green
    "#2196F3", // Blue
    "#FF9800", // Orange
    "#9C27B0", // Purple
    "#F44336", // Red
    "#00BCD4", // Cyan
    "#FFC107", // Amber
    "#8BC34A", // Light Green
    "#E91E63", // Pink
    "#607D8B", // Blue Grey
  ];
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
              color: brandColors[index % brandColors.length], // Cycle through brand colors
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
            {isCountLoading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <>
                <div className="text-2xl font-bold">{count?.totalModules}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </>
            )}
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
            {isCountLoading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {count?.totalStudents || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </>
            )}
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
            {isCountLoading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {count?.totalTeachers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +2 new this month
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isCountLoading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {count?.totalGroups || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +2 new this month
                </p>
              </>
            )}
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
            {isModuleStatsLoading ? (
              <Loader />
            ) : moduleStats?.length ? (
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
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                No data available for the chart.
              </p>
            )}
          </CardContent>
        </Card>
        <PieChartCompo />
      </div>
    </div>
  );
};
