"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { trpc } from "@/app/_trpc/client";

export const PieChartCompo = () => {
  const { data: moduleStats, isLoading } = trpc.getModuleGroupStats.useQuery();

  // Transform data for the pie chart
  const chartData = React.useMemo(() => {
    if (!moduleStats) return [];
    const groupData: Record<string, number> = {};

    moduleStats.forEach((module) => {
      module.groups.forEach((group) => {
        if (group.name) {
          if (!groupData[group.name]) {
            groupData[group.name] = 0;
          }
          groupData[group.name] += group.studentCount;
        }
      });
    });

    return Object.entries(groupData).map(
      ([groupName, studentCount], index) => ({
        group: groupName,
        students: studentCount,
        fill: `hsl(var(--chart-${(index % 5) + 1}))`, // Use global chart colors
      })
    );
  }, [moduleStats]);

  const totalStudents = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.students, 0);
  }, [chartData]);

  // Ensure chartData is not undefined or null
  if (!chartData || chartData.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Group Distribution</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Group Distribution</CardTitle>
        <CardDescription>Total Students by Group</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          className="mx-auto aspect-square max-h-[250px]"
          config={{}}
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="students"
              nameKey="group"
              innerRadius={60}
              outerRadius={100}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalStudents.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Students
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total students grouped by their respective groups
        </div>
      </CardFooter>
    </Card>
  );
};
