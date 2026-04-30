"use client";

import { Card, Chip } from "@heroui/react";

// helper: get YYYY-MM key
const getMonthKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth()}`;
};

const getMonthLabel = (date) =>
  new Date(date).toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
  });

export default function KpiDash({ shipments = [], selectedMonth }) {
  // ================= CURRENT MONTH =================
  const now = new Date();
  const activeMonth =
    selectedMonth ?? `${now.getFullYear()}-${now.getMonth()}`;

  const [year, month] = activeMonth.split("-").map(Number);

  const isSameMonth = (date) => {
    const d = new Date(date);
    return d.getFullYear() === year && d.getMonth() === month;
  };

  const isPrevMonth = (date) => {
    const d = new Date(date);
    const prev = new Date(year, month - 1);
    return (
      d.getFullYear() === prev.getFullYear() &&
      d.getMonth() === prev.getMonth()
    );
  };

  // ================= FILTERS =================
  const currentShipments = shipments.filter((s) =>
    s.pickupTime ? isSameMonth(s.pickupTime) : false
  );

  const prevShipments = shipments.filter((s) =>
    s.pickupTime ? isPrevMonth(s.pickupTime) : false
  );

  // ================= CORE CALCS =================
  const calcTotals = (list) => {
    const projected = list.reduce(
      (sum, s) => sum + (s.projectedQty || 0),
      0
    );

    const actual = list.reduce(
      (sum, s) => sum + (s.actualQty || 0),
      0
    );

    return { projected, actual, variance: actual - projected };
  };

  const current = calcTotals(currentShipments);
  const previous = calcTotals(prevShipments);

  const percentage =
    current.projected > 0
      ? (current.actual / current.projected) * 100
      : 0;

  const prevPercentage =
    previous.projected > 0
      ? (previous.actual / previous.projected) * 100
      : 0;

  // ================= TREND HELPER =================
  const getTrend = (currentVal, prevVal) => {
    if (prevVal === 0) return null;
    return ((currentVal - prevVal) / prevVal) * 100;
  };

  const trendActual = getTrend(current.actual, previous.actual);
  const trendProjected = getTrend(current.projected, previous.projected);
  const trendPercentage = getTrend(percentage, prevPercentage);

  const trendColor = (v) =>
    v > 0 ? "text-green-600" : v < 0 ? "text-red-600" : "text-gray-400";

  const formatTrend = (v) =>
    v === null ? "N/A" : `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;

  // ================= STATUS =================
  const statusColorMap = {
    "Shipped Full": "success",
    "Shipped Partial": "warning",
    "Not Shipped": "danger",
    "Shipped Over": "accent",
  };

  const statusStats = Object.keys(
    currentShipments.reduce((acc, s) => {
      acc[s.status] = true;
      return acc;
    }, {})
  ).map((status) => {
    const items = currentShipments.filter((s) => s.status === status);

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

  // ================= UI =================
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">

      {/* ================= CURRENT MONTH STATUS ================= */}
      <Card className="p-4 space-y-0 ">
        <Chip variant="soft" color="success" className="font-semibold text-black px-2 shadow-sm rounded-md ">
          This Month ({getMonthLabel(activeMonth)})
        </Chip>

        {statusStats.map((s) => (
          <div key={s.status} className="flex justify-between items-start">
            <Chip color={statusColorMap[s.status]} variant="soft">
              {s.status}
            </Chip>

            <div className="text-right flex font-semibold">
              <div className="text-xs text-gray-500 mr-2">
                {s.actual}/{s.projected} →{" "}
                <Chip color={statusColorMap[s.status]} variant="soft">
                  {s.percentage.toFixed(0)}%
                </Chip>
              </div>

              <div>{s.count}</div>
            </div>
          </div>
        ))}
      </Card>

      {/* ================= KPI TREND CARD ================= */}
      <Card className="p-4 space-y-2">
      <Chip variant="soft" color="success" className="font-semibold text-black px-2 shadow-sm rounded-md ">Trend vs Last Month</Chip>

        <div className="text-sm flex justify-between">
          <span>Actual</span>
          <span className={trendColor(trendActual)}>
            {formatTrend(trendActual)}
          </span>
        </div>

        <div className="text-sm flex justify-between">
          <span>Projected</span>
          <span className={trendColor(trendProjected)}>
            {formatTrend(trendProjected)}
          </span>
        </div>

        <div className="text-sm flex justify-between">
          <span>Efficiency</span>
          <span className={trendColor(trendPercentage)}>
            {formatTrend(trendPercentage)}
          </span>
        </div>
      </Card>

      {/* ================= TOTAL (CURRENT MONTH ONLY) ================= */}
      <Card className="p-4 space-y-0">
      <Chip variant="soft" color="success" className="font-semibold text-black px-2 shadow-sm rounded-md ">Monthly Totals</Chip>

        <div className="flex justify-between text-sm">
          <span>Projected</span>
          <span className="">{current.projected}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Actual</span>
          <span className="">{current.actual}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Variance</span>
          <span
            className={` ${
              current.variance >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {current.variance}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Efficiency</span>
          <span className="font-semibold">
            {percentage.toFixed(0)}%
          </span>
        </div>
      </Card>

    </div>
  );
}