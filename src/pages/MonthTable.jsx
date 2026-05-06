"use client";

import React, { useMemo } from "react";
import {
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  format
} from "date-fns";
import { Chip, Card } from "@heroui/react";

function MonthTable({ shipments, isDark }) {
  // ===== YEAR RANGE
  const yearStart = startOfYear(new Date());
  const yearEnd = endOfYear(new Date());

  const months = useMemo(() => {
    return eachMonthOfInterval({
      start: yearStart,
      end: yearEnd
    });
  }, []);

  // ===== DATA
  const monthData = useMemo(() => {
    const map = {};

    months.forEach((m) => {
      const key = format(m, "yyyy-MM");
      map[key] = {
        projected: 0,
        actual: 0,
        projectedQty: 0,
        actualQty: 0
      };
    });

    shipments.forEach((s) => {
      if (!s.pickupTime) return;

      const date = new Date(s.pickupTime);
      const key = format(date, "yyyy-MM");

      if (!map[key]) return;

      const pQty = s.projectedQty || 0;
      const aQty = s.actualQty || 0;
      const price = s.price || 0;

      map[key].projectedQty += pQty;
      map[key].actualQty += aQty;
      map[key].projected += pQty * price;
      map[key].actual += aQty * price;
    });

    return map;
  }, [shipments, months]);

  // ===== TOTALS
  const totals = useMemo(() => {
    let projected = 0;
    let actual = 0;

    Object.values(monthData).forEach((m) => {
      projected += m.projected;
      actual += m.actual;
    });

    return {
      projected,
      actual,
      variance: actual - projected,
      efficiency: projected
        ? ((actual / projected) * 100).toFixed(1)
        : 0
    };
  }, [monthData]);

  // ===== COLORS
   const getColor = (p, a) => {
    const hasData = p > 0 || a > 0;
  
    if (!hasData) {
      return isDark ? "bg-zinc-950" : "bg-gray-100";
    }
  
    if (a > p) return isDark ? "bg-[#2f5d3a]" : "bg-success-soft";
    if (a < p) return isDark ? "bg-[#5d2f34]" : "bg-danger-soft";
  
    return isDark ? "bg-[#2a2f45]" : "bg-blue-100";
  };

  const getEffColor = (eff) => {
    if (eff >= 100) return "success";
    if (eff >= 90) return "warning";
    return "danger";
  };

  return (
    <Card className="border-0 shadow-md border">
      <Card.Content>

        {/* ===== TITLE ===== */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold">
            Yearly Shipping Overview
          </h3>

          <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Monthly breakdown of projected vs shipped quantities and performance across the year
          </p>
        </div>

        {/* ===== KPI ROW ===== */}
        <div className="grid grid-cols-4 gap-3 mb-6">
        <Chip color="accent" variant="soft">
            Projected ${totals.projected.toLocaleString()}
          </Chip>
          <Chip color="success" variant="soft">
            Shipped ${totals.actual.toLocaleString()}
          </Chip>

        

          <Chip color="warning" variant="soft">
            Δ ${totals.variance.toLocaleString()}
          </Chip>

          <Chip color="secondary" variant="soft">
            Eff {totals.efficiency}%
          </Chip>
        </div>

        {/* ===== MONTH GRID ===== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-12 gap-1">

          {months.map((month) => {
            const key = format(month, "yyyy-MM");
            const m = monthData[key];

            const diff = m.actual - m.projected;

            const efficiency = m.projected
              ? ((m.actual / m.projected) * 100).toFixed(0)
              : 0;

            const bg = getColor(m.projected, m.actual);

            return (
              <div
                key={key}
                className={`relative p-2 rounded-lg min-h-[80px] border ${bg} ${
                  isDark ? "border-zinc-800" : "border-gray-200"
                }`}
              >
                {/* HEADER */}
                <div className="flex justify-between text-xs font-semibold">
                  <span>{format(month, "MMM")}</span>
                
                </div>

                {/* CONTENT */}
                {(m.projected > 0 || m.actual > 0) && (
                  <div className="mt-3 text-[13px] space-y-1">

                    <div className={`${isDark ? "text-blue-300" : "text-blue-800"} font-medium`}>
                     ${Math.round(m.projected).toLocaleString()}
                    </div>

                    <div className={`${isDark ? "text-green-300" : "text-green-800"} font-medium`}>
                     ${Math.round(m.actual).toLocaleString()}
                    </div>

                  </div>
                )}

                {/* EFFICIENCY CHIP */}
                {m.projected > 0 && (
                  <div className="absolute top-0 right-2">
                    <Chip
                      size="sm"
                      variant="primary"
                      color={getEffColor(efficiency)}
                      className="text-[11px] h-5 px-2"
                    >
                      {efficiency}%
                    </Chip>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </Card.Content>
    </Card>
  );
}

export default MonthTable;