"use client";

import React, { useEffect, useMemo, useState } from "react";

import { Chip, Drawer, Card, Button } from "@heroui/react";
import { ArrowShapeLeft, ArrowShapeRight } from "@gravity-ui/icons";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
} from "date-fns";
import KpiDash from "./KpiDash";
import BarDash from "./BarDash";

function Dashboard({isDark}) {
  const [shipments, setShipments] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  // ✅ FIXED MODAL STATE
  const [selectedDate, setSelectedDate] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString("en-GB", {
    month: "long",
  });

  // ================= FETCH =================
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/shipments`)
      .then((r) => r.json())
      .then(setShipments);
  }, []);

  // ================= DAYS =================
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));

    const arr = [];
    let d = start;

    while (d <= end) {
      arr.push(new Date(d));
      d = addDays(d, 1);
    }

    return arr;
  }, [currentDate]);
  const statusColorMap = {
    "Shipped Full": "success",
    "Shipped Partial": "warning",
    "Not Shipped": "danger",
    "Shipped Over": "accent",
  };

  // ================= DATA =================
  const dailyData = useMemo(() => {
    const map = {};

    shipments.forEach((s) => {
      if (!s.pickupTime) return;

      const d = new Date(s.pickupTime);
      const key = format(d, "yyyy-MM-dd");

      if (!map[key]) {
        map[key] = { projected: 0, actual: 0 };
      }

      const projected = (s.projectedQty || 0) * (s.price || 0);
      const actual = (s.actualQty || 0) * (s.price || 0);

      map[key].projected += projected;
      map[key].actual += actual;
    });

    return map;
  }, [shipments]);

  // ================= VARIANCE COLOR =================
  const getColor = (projected, actual) => {
    if (actual > projected) return "bg-success-soft ";
    if (actual < projected) return "bg-danger-soft ";
    return "bg-gray-50 ";
  };

  // ================= CLICK FIX =================
  const handleDayClick = (date) => {
    setSelectedDate(date);
    setIsOpen(true); // 🔥 THIS WAS MISSING / NOT RELIABLE BEFORE
  };

  // ================= NAV =================
  const prevMonth = () =>
    setCurrentDate(new Date(year, month - 1, 1));

  const nextMonth = () =>
    setCurrentDate(new Date(year, month + 1, 1));



    


  return (
    <div className="p-4">
<KpiDash shipments={shipments} />

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <Chip onClick={prevMonth} variant="soft" size="lg" color="accent" className="hover:cursor-pointer">
          <ArrowShapeLeft />
        </Chip>

        <Chip variant="soft" size="lg" color="success">
          {monthName} {year} Shipping Summary
        </Chip>

        <Chip onClick={nextMonth} variant="soft" size="lg" color="accent" className="hover:cursor-pointer">
          <ArrowShapeRight />
        </Chip>
      </div>

      {/* CALENDAR */}
      <div className="grid grid-cols-7 gap-px  rounded-xl overflow-hidden">

        {/* HEADER */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="bg-[#F9C97C] text-center text-xs font-semibold py-2"
          >
            {d}
          </div>
        ))}

        {/* CELLS */}
        {days.map((date) => {
  const key = format(date, "yyyy-MM-dd");
  const data = dailyData[key] || { projected: 0, actual: 0 };

  const isCurrentMonth = date.getMonth() === month;

  const cellColor = getColor(data.projected, data.actual);

  // ✅ DEFINE IT HERE (NOT INSIDE JSX)
  const hasValues = data.projected !== 0 || data.actual !== 0;

  return (
    <div
      key={key}
      onClick={() => handleDayClick(date)}
      className={`
        min-h-[100px] p-2 cursor-pointer rounded-md
        border transition-all
        ${cellColor}
        ${!isCurrentMonth ? "opacity-0" : ""}
        hover:brightness-95
      `}
    >
      <div className="text-xs font-semibold text-gray-700 flex justify-between">
        <div>{format(date, "d")}</div>
        <div>
          ${(data.actual - data.projected).toLocaleString()}
        </div>
      </div>

      {/* ✅ NOW THIS WORKS */}
      {hasValues && (
        <div className="text-[11px] mt-2 space-y-1">
          <div className="text-blue-700 font-medium">
            P: ${data.projected.toLocaleString()}
          </div>

          <div className="text-green-700 font-medium">
            A: ${data.actual.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
})}
      </div>
      <BarDash shipments={shipments} />
      {/* MODAL (FIXED CONTROLLED) */}
      <Drawer>
  <Drawer.Backdrop
    isOpen={isOpen}
    onOpenChange={setIsOpen}
    variant="opaque"
  >
    <Drawer.Content placement="right">
      <Drawer.Dialog className="w-[500px] p-4">

        <Drawer.Header>
          <Drawer.Heading>
            Shipments on {selectedDate?.toDateString()}
          </Drawer.Heading>

          <Drawer.CloseTrigger />
        </Drawer.Header>

        <Drawer.Body className="space-y-3">

          {(() => {
            if (!selectedDate) return null;

            const filtered = shipments.filter((s) => {
              if (!s.pickupTime) return false;
              return (
                new Date(s.pickupTime).toDateString() ===
                selectedDate.toDateString()
              );
            });

            if (!filtered.length) {
              return (
                <p className="text-center text-gray-500">
                  No shipments
                </p>
              );
            }

            return (
              <div className="grid grid-cols-1 gap-1">
                {filtered.map((s) => (
                  <Card key={s._id} className="p-4">
                    <div className="font-bold">{s.customer}</div>
<div className="flex justify-between">

<Chip color={statusColorMap[s.status]} variant="soft">
              {s.status}
            </Chip>
                    <Chip variant="soft" color="danger">
                      {s.plant}
                    </Chip>
                   
                    </div>
                    <div className="mt-2 text-sm">
                      <div>
                        P: $
                        {(s.projectedQty * s.price || 0).toLocaleString()}
                      </div>

                      <div>
                        A: $
                        {(s.actualQty * s.price || 0).toLocaleString()}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            );
          })()}

        </Drawer.Body>

        <Drawer.Footer>
          <Button onPress={() => setIsOpen(false)}>
            Close
          </Button>
        </Drawer.Footer>

      </Drawer.Dialog>
    </Drawer.Content>
  </Drawer.Backdrop>
</Drawer>
    </div>
  );
}

export default Dashboard;