"use client";

import React, { useMemo } from "react";
import { Card } from "@heroui/react";
import { format, startOfWeek } from "date-fns";

export default function BarDash({ shipments = [] }) {
  const [tooltip, setTooltip] = React.useState(null);
  // ================= GROUP BY WEEK + PLANT =================
  const chartData = useMemo(() => {
    const map = {};

    shipments.forEach((s) => {
      if (!s.pickupTime || !s.plant) return;

      const date = new Date(s.pickupTime);
      const weekKey = format(startOfWeek(date), "yyyy-MM-dd");
      const plant = s.plant;

      if (!map[weekKey]) {
        map[weekKey] = {};
      }

      if (!map[weekKey][plant]) {
        map[weekKey][plant] = 0;
      }

      // COUNT SHIPMENTS (not qty)
      map[weekKey][plant] += 1;
    });

    return Object.entries(map)
      .map(([week, plants]) => ({
        week,
        plants,
        total: Object.values(plants).reduce((a, b) => a + b, 0),
      }))
      .sort((a, b) => new Date(a.week) - new Date(b.week));
  }, [shipments]);

  // ================= PLANT COLORS (DYNAMIC) =================
  const plantList = useMemo(() => {
    const set = new Set();
    shipments.forEach((s) => s.plant && set.add(s.plant));
    return Array.from(set);
  }, [shipments]);

  const colorPalette = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-yellow-500",
  ];

  const getColor = (plant) => {
    const index = plantList.indexOf(plant);
    return colorPalette[index % colorPalette.length];
  };

  // ================= MAX VALUE =================
  const maxValue = Math.max(
    ...chartData.map((d) => d.total),
    1
  );

  // ================= UI =================
  return (
    <Card className="p-4 mt-5">
      <h3 className="font-semibold mb-4">
        Shipments per Week (by Plant)
      </h3>

      <div className="flex items-end gap-4 h-[220px] relative">

  {chartData.map((d, index) => (
    <div
      key={d.week}
      className="flex flex-col items-center flex-1 relative"
    >

      {/* STACK BAR */}
      <div className="relative flex flex-col justify-end w-full h-[180px] gap-[2px]">

        {Object.entries(d.plants).map(([plant, count]) => {
          const height = (count / maxValue) * 180;

          return (
            <div
              key={plant}
              className={`${getColor(plant)} w-full rounded-sm relative cursor-pointer group`}
              style={{ height }}

              onMouseEnter={(e) =>
                setTooltip({
                  plant,
                  count,
                  week: d.week,
                  x: e.clientX,
                  y: e.clientY,
                })
              }

              onMouseLeave={() => setTooltip(null)}
            >

              {/* 🔥 INSIDE LABEL */}
              {height > 18 && (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                  {count}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* WEEK LABEL (still visible but smaller) */}
      <div className="text-[10px] mt-2 text-gray-500">
        {d.week}
      </div>

      {/* TOTAL INSIDE BAR TOP */}
      <div className="absolute top-0 text-[11px] font-semibold text-gray-700">
        {d.total}
      </div>

    </div>
  ))}
</div>


      {/* LEGEND */}
      <div className="flex gap-3 mt-4 flex-wrap text-xs">
        {plantList.map((plant, i) => (
          <div key={plant} className="flex items-center gap-1">
            <div
              className={`w-3 h-3 rounded-sm ${colorPalette[i % colorPalette.length]}`}
            />
            {plant}
          </div>
        ))}
      </div>
      {tooltip && (
  <div
    className="fixed z-50 px-3 py-2 rounded-lg shadow-lg bg-black text-white text-xs pointer-events-none"
    style={{
      left: tooltip.x + 10,
      top: tooltip.y + 10,
    }}
  >
    <div className="font-semibold">{tooltip.plant}</div>
    <div>Shipments: {tooltip.count}</div>
    <div className="text-gray-300 text-[10px]">
      Week: {tooltip.week}
    </div>
  </div>
)}
    </Card>
    
  );
}