"use client";

// HeroUI
import { Button as HeroButton } from "@heroui/react";

// AntD
import { Upload, Button as AntButton } from "antd";
import { UploadOutlined } from "@ant-design/icons";

import * as XLSX from "xlsx";
import { toast } from "react-toastify";

export default function BulkShipments({ onSuccess }) {

  // ================= TEMPLATE =================
  const downloadTemplate = () => {
    const data = [
      {
        plant: "Plant A",
        status: "Shipped Full",
        customer: "Customer 1",
        engNumber: "SKU-001",
        sapPart: "SAP-123",
        description: "Sample shipment",
        projectedQty: 100,
        actualQty: 95,
        price: 10,
        poNumber: "PO-001",
        salesOrder: "SO-001",
        carrier: "DHL",
        loadNumber: "LOAD-001",
        pickupTime: "2025-01-01T10:00",
        notes: "Sample note",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Shipments");

    XLSX.writeFile(wb, "shipment_template.xlsx");
  };

  // ================= UPLOAD =================
  const handleUpload = async (file) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        // 🔥 SEND TO BACKEND
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/shipments/bulk`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(json),
        });

        const result = await res.json();

        if (!res.ok) throw new Error(result.message);

        toast.success(`${result.count || json.length} shipments uploaded`);

        // 🔥 REFRESH TABLE
        onSuccess?.();

      } catch (err) {
        toast.error(err.message || "Upload failed");
      }
    };

    reader.readAsArrayBuffer(file);

    return false;
  };

  return (
    <div className="flex gap-3 mb-4">

      {/* DOWNLOAD TEMPLATE */}
      <HeroButton
        variant="soft"
        className="bg-warning-soft flex items-center gap-2"
        onPress={downloadTemplate}
      >
        Download Template
      </HeroButton>

      {/* UPLOAD */}
      <Upload
        beforeUpload={(file) => {
          handleUpload(file);
          return false;
        }}
        showUploadList={false}
        accept=".xlsx"
      >
        <AntButton icon={<UploadOutlined />}>
          Upload Excel
        </AntButton>
      </Upload>
    </div>
  );
}