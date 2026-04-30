"use client";

import { Card, Chip } from "@heroui/react";

export default function Kpi({ shipments = [] }) {

  // ================= STATUS COUNTS =================
  const statusCounts = shipments.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});

  // ================= TODAY FILTER =================
  const today = new Date().toISOString().split("T")[0];

  const todayShipments = shipments.filter((s) => {
    if (!s.pickupTime) return false;
    return s.pickupTime.startsWith(today);
  });

  const todayStatusCounts = todayShipments.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});

  // ================= TOTALS =================
  const totalProjected = shipments.reduce(
    (sum, s) => sum + (s.projectedQty || 0),
    0
  );

  const totalActual = shipments.reduce(
    (sum, s) => sum + (s.actualQty || 0),
    0
  );

  const variance = totalActual - totalProjected;

  // ================= COLORS =================
  const statusColorMap = {
    "Shipped Full": "success",
    "Shipped Partial": "warning",
    "Not Shipped": "danger",
    "Shipped Over": "accent",
  };

  const statusStats = Object.entries(statusCounts).map(([status]) => {
    const items = shipments.filter((s) => s.status === status);
  
    const projected = items.reduce(
      (sum, s) => sum + (s.projectedQty || 0),
      0
    );
  
    const actual = items.reduce(
      (sum, s) => sum + (s.actualQty || 0),
      0
    );
  
    const percentage =
      projected > 0 ? (actual / projected) * 100 : 0;
  
    return {
      status,
      count: items.length,
      projected,
      actual,
      percentage,
    };
  });

  const todayStatusStats = Object.entries(todayStatusCounts).map(([status]) => {
    const items = todayShipments.filter((s) => s.status === status);
  
    const projected = items.reduce(
      (sum, s) => sum + (s.projectedQty || 0),
      0
    );
  
    const actual = items.reduce(
      (sum, s) => sum + (s.actualQty || 0),
      0
    );
  
    const percentage =
      projected > 0 ? (actual / projected) * 100 : 0;
  
    return {
      status,
      count: items.length,
      projected,
      actual,
      percentage,
    };
  });



  const percentage =
  totalProjected > 0
    ? (totalActual / totalProjected) * 100
    : 0;
  // ================= UI =================
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">

      {/* ================= STATUS KPI ================= */}
      <Card className="p-4 space-y-0">
        <h3 className="font-semibold">All Shipments</h3>

        {statusStats.map((s) => (
  <div key={s.status} className="flex justify-between items-start">
    
    {/* LEFT SIDE */}
    <div className="flex flex-col">
      <Chip
        color={statusColorMap[s.status] || "default"}
        variant="soft"
      >
        {s.status}
      </Chip>
    </div>

    {/* RIGHT SIDE */}
    <div className="text-right font-semibold">
      <div className="flex ">
          <div className="text-xs text-gray-500 font-normal mr-4">
        {s.actual}/{s.projected} →{" "}
        <Chip
        color={statusColorMap[s.status] || "default"}
        variant="soft"
      > {s.percentage.toFixed(0)}%
      </Chip>
      </div>
      <div>{s.count}</div>

    
      </div>
    </div>

  </div>
))}
      </Card>

      {/* ================= TODAY KPI ================= */}
      <Card className="p-4 space-y-0">
  <h3 className="font-semibold">Today Shipments</h3>

  {todayStatusStats.length === 0 && (
    <p className="text-sm text-gray-400 mt-2">No shipments today</p>
  )}

  {todayStatusStats.map((s) => (
    <div key={s.status} className="flex justify-between items-start">
      
      {/* LEFT SIDE */}
      <div className="flex flex-col">
        <Chip
          color={statusColorMap[s.status] || "default"}
          variant="soft"
        >
          {s.status}
        </Chip>
      </div>

      {/* RIGHT SIDE */}
      <div className="text-right font-semibold">
        <div className="flex">
          
          <div className="text-xs text-gray-500 font-normal mr-4">
            {s.actual}/{s.projected} →{" "}
            <Chip
              color={statusColorMap[s.status] || "default"}
              variant="soft"
            >
              {s.percentage.toFixed(0)}%
            </Chip>
          </div>

          <div>{s.count}</div>

        </div>
      </div>

    </div>
  ))}
</Card>

      {/* ================= TOTAL KPI ================= */}
      <Card className="p-4 space-y-1">

<h3 className="font-semibold">Totals</h3>

<div className="flex justify-between text-sm pb-0 mb-0 mt-0 pt-0">
  <span>Projected</span>
  <span className="font-semibold">{totalProjected}</span>
</div>

<div className="flex text-sm pb-0 mb-0 mt-0 pt-0 justify-between">
  <span>Actual</span>
  <span className="font-semibold">{totalActual}</span>
</div>

<div className="flex justify-between text-sm pb-0 mb-0 mt-0 pt-0">
  <span>Variance</span>
  <span
    className={`font-semibold ${
      variance >= 0 ? "text-green-600" : "text-red-600"
    }`}
  >
    {variance}
  </span>
</div>

{/* ✅ ADD THIS ONLY */}
<div className="flex justify-between  text-sm pb-0 mb-0 mt-0 pt-0 ">
  <span>Percentage </span>
  <span className="font-semibold">
    {percentage.toFixed(0)}%
  </span>
</div>

</Card>

    </div>
  );
}