// HeroUI button
import { Button as HeroButton } from "@heroui/react";

// Ant Design
import { Upload, Button as AntButton } from "antd";
import { UploadOutlined } from "@ant-design/icons";

import * as XLSX from "xlsx";
import { toast } from "react-toastify";

export default function BulkUpload({ onSuccess }) {

  // 📥 DOWNLOAD TEMPLATE (frontend file)
  const downloadTemplate = () => {
    const data = [
      {
        skuId: "SKU-001",
        name: "Sample Item",
        category: "Food",
        stock: 10,
        description: "Sample description",
        unitPrice: 5.99,
      },
    ];
  
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SKUs");
  
    // safer browser trigger
    XLSX.writeFile(wb, "sku_template.xlsx");
  };

  // 📤 UPLOAD EXCEL
  const handleUpload = async (file) => {
    const reader = new FileReader();
  
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
  
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
  
        const json = XLSX.utils.sheet_to_json(sheet);
  
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/skus/bulk`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(json),
        });
  
        const result = await res.json();
  
        if (!res.ok) throw new Error(result.message);
  
        toast.success(`${result.count || json.length} items uploaded`);
        onSuccess?.();
  
      } catch (err) {
        toast.error(err.message || "Upload failed");
      }
    };
  
    reader.readAsArrayBuffer(file);
  
    return false; // prevent auto upload
  };

  return (
    <div className="flex gap-3 mb-4">
    {/* ✅ HEROUI BUTTON */}
    <HeroButton variant="soft" className="mb-4 bg-warning-soft flex items-center gap-2 " onPress={downloadTemplate}>
      Download Template
    </HeroButton>
  
    {/* ✅ ANTD UPLOAD */}
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