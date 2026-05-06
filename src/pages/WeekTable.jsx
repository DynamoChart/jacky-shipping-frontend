"use client";

import React, { useMemo } from "react";
import {
  startOfWeek,
  addDays,
  format
} from "date-fns";
import { Chip, Card } from "@heroui/react";

function WeekTable({ shipments, isDark }) {
  // ===== WEEK
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) =>
      addDays(weekStart, i)
    );
  }, [weekStart]);

  // ===== DATA
  const weekData = useMemo(() => {
    const map = {};

    weekDays.forEach((d) => {
      const key = format(d, "yyyy-MM-dd");
      map[key] = {
        projected: 0,
        actual: 0,
        projectedQty: 0,
        actualQty: 0
      };
    });

    shipments.forEach((s) => {
      if (!s.pickupTime) return;

      const key = format(new Date(s.pickupTime), "yyyy-MM-dd");
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
  }, [shipments, weekDays]);

  // ===== TOTALS
  const totals = useMemo(() => {
    let projected = 0;
    let actual = 0;

    Object.values(weekData).forEach((d) => {
      projected += d.projected;
      actual += d.actual;
    });

    return {
      projected,
      actual,
      variance: actual - projected,
      efficiency: projected
        ? ((actual / projected) * 100).toFixed(1)
        : 0
    };
  }, [weekData]);

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
    <Card className="border-0 shadow-md border mt-6 mb-6">
      <Card.Content>

        {/* ===== TITLE + DESCRIPTION ===== */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold">
            Weekly Shipping Overview
          </h3>

          <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Current week performance from Monday to Sunday showing projected vs shipped quantities and values
          </p>
        </div>

        {/* ===== KPIs (UNCHANGED) ===== */}
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

        {/* ===== WEEK CARDS ===== */}
        <div className="grid grid-cols-7 gap-2">

          {weekDays.map((date) => {
            const key = format(date, "yyyy-MM-dd");
            const d = weekData[key];

            const diff = d.actual - d.projected;
            const bg = getColor(d.projected, d.actual);

            const efficiency = d.projected
              ? ((d.actual / d.projected) * 100).toFixed(0)
              : 0;

            return (
              <div
                key={key}
                className={`relative p-3 pb-7 rounded-lg min-h-[110px] border transition-colors ${bg} ${
                  isDark ? "border-zinc-800" : "border-gray-200"
                }`}
              >
                {/* HEADER */}
                <div className="text-xs font-semibold flex justify-between">
                  <span>{format(date, "EEE")}</span>
                  <span className="opacity-70">
                    {format(date, "d")}
                  </span>
                </div>

                {/* CONTENT */}
                {(d.projected !== 0 || d.actual !== 0) && (
                  <div className="mt-2 text-[13px] space-y-1">

                    <div className={`${isDark ? "text-blue-300" : "text-blue-800"} font-medium`}>
                      P: {d.projectedQty} · ${Math.round(d.projected).toLocaleString()}
                    </div>

                    <div className={`${isDark ? "text-green-300" : "text-green-800"} font-medium`}>
                      A: {d.actualQty} · ${Math.round(d.actual).toLocaleString()}
                      
                    </div>

                    <div className="text-xs font-semibold">
                      Δ ${diff.toLocaleString()}
                    </div>
                  </div>
                )}

                {/* ✅ BOTTOM RIGHT EFFICIENCY CHIP */}
                {d.projected > 0 && (
                  <div className="absolute bottom-2 right-2">
                    <Chip
                      size="sm"
                      variant="primary"
                     
                      color={getEffColor(efficiency)}
                      className="text-[10px] h-5 px-2"
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

export default WeekTable;