"use client";

import React, { useMemo } from "react";

import {
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  format,
} from "date-fns";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  LabelList,
} from "recharts";

import {
  TrendingUp,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";


import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

function MonthlyShipmentChart({
  shipments,
  isDark,
}) {
  // ===== MONTHS
  const months = eachMonthOfInterval({
    start: startOfYear(new Date()),
    end: endOfYear(new Date()),
  });

  // ===== DATA
  const chartData = useMemo(() => {
    const map = {};

    months.forEach((month) => {
      const key = format(month, "yyyy-MM");

      map[key] = {
        month: format(month, "MMMM"),
        projected: 0,
        actual: 0,
      };
    });

    shipments.forEach((s) => {
      if (!s.pickupTime) return;

      const key = format(
        new Date(s.pickupTime),
        "yyyy-MM"
      );

      if (!map[key]) return;

      const projected =
        (s.projectedQty || 0) *
        (s.price || 0);

      const actual =
        (s.actualQty || 0) *
        (s.price || 0);

      map[key].projected += projected;
      map[key].actual += actual;
    });

    return Object.values(map).map((m) => ({
      ...m,
      projected: Math.round(m.projected),
      actual: Math.round(m.actual),
    }));
  }, [shipments]);

  // ===== TOTALS
  const totals = useMemo(() => {
    let projected = 0;
    let actual = 0;

    chartData.forEach((m) => {
      projected += m.projected;
      actual += m.actual;
    });

    const efficiency =
      projected > 0
        ? ((actual / projected) * 100).toFixed(1)
        : 0;

    return {
      projected,
      actual,
      efficiency,
    };
  }, [chartData]);

  // ===== SHADCN CONFIG
  const chartConfig = {
    projected: {
      label: "Projected",
      color: "var(--chart-1)",
    },

    actual: {
      label: "Shipped",
      color: "var(--chart-2)",
    },
  };

  return (
    <Card
      className={`mt-4 rounded-4xl  ${
        isDark
          ? "bg-zinc-900 border-zinc-800"
          : ""
      }`}
    >
      {/* ===== HEADER ===== */}
      <CardHeader >
        <CardTitle>
          Yearly Shipping Overview
        </CardTitle>

        <CardDescription>
          Monthly breakdown of projected vs
          shipped quantities and performance
          across the year
        </CardDescription>
      </CardHeader>

      {/* ===== CONTENT ===== */}
      <CardContent >

        <ChartContainer
          config={chartConfig}
          className="max-h-[360px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            
          >
         

            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                value.slice(0, 3)
              }
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dashed"
                />
              }
            />

        {/* PROJECTED */}
            <Bar
              dataKey="projected"
              fill="#3B82F6"
              radius={[6, 6, 0, 0]}
            >
              <LabelList
                dataKey="projected"
                position="inside"
                formatter={(value) =>
                  `${Math.round(value / 1000)}k`
                }
                className="fill-current  text-[12px] font-bold "
              />
            </Bar>

            {/* ACTUAL */}
            <Bar
              dataKey="actual"
              fill="#22C55E"
              radius={[6, 6, 0, 0]}
            >
              <LabelList
                dataKey="actual"
                position="inside"
                formatter={(value) =>
                  `${Math.round(value / 1000)}k`
                }
                className="fill-current   text-[12px] font-bold"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>

      {/* ===== FOOTER ===== */}
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Efficiency {totals.efficiency}% this year

          <TrendingUp className="h-4 w-4" />
        </div>

        <div className="leading-none text-muted-foreground">
          Projected $
          {totals.projected.toLocaleString()} ·
          Shipped $
          {totals.actual.toLocaleString()}
        </div>
      </CardFooter>
    </Card>
  );
}

export default MonthlyShipmentChart;