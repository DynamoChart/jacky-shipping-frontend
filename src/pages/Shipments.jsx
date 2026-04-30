"use client";

import {
  Spinner,
  Modal,
  Button,
  Input,
  Autocomplete,
  ListBox,
  Label,
  DatePicker,
  DateField,
  Calendar,
  TimeField,
} from "@heroui/react";
import BulkShipments from "./BulkShipments";
import { useEffect, useState } from "react";
import Kpi from "./Kpi";
import { Plus } from "@gravity-ui/icons";
import { toast } from "react-toastify";
import ShipmentsTable from "./ShipmentsTable";
export default function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [plants, setPlants] = useState([]);
  const [skus, setSkus] = useState([]);

  const [selectedPlant, setSelectedPlant] = useState(null);
  const [selectedSku, setSelectedSku] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const [pickupTime, setPickupTime] = useState(null);

  const [form, setForm] = useState({
    plant: "",
    status: "",
    customer: "",
    engNumber: "",
    sapPart: "",
    description: "",
    projectedQty: 0,
    actualQty: 0,
    price: 0,
    poNumber: "",
    salesOrder: "",
    carrier: "",
    loadNumber: "",
    notes: "",
  });

  // ================= FETCH =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plantsRes, skusRes] = await Promise.all([
          fetch("http://localhost:5000/api/plants"),
          fetch("http://localhost:5000/api/skus"),
        ]);

        const plantsData = await plantsRes.json();
        const skusData = await skusRes.json();

        setPlants(plantsData);
        setSkus(skusData);
      } catch {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const fetchShipments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/shipments");
      const data = await res.json();
      setShipments(data);
    } catch {
      toast.error("Failed to fetch shipments");
    }
  };


  useEffect(() => {
    fetchShipments();
  }, []);
  // ================= ADD =================
  const handleAddShipment = async () => {
    const payload = {
      ...form,
      pickupTime,
    };

    console.log("SHIPMENT PAYLOAD:", payload);

    try {
      const res = await fetch("http://localhost:5000/api/shipments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      toast.success("Shipment created");
await fetchShipments(); // 🔥 THIS updates table
    } catch (err) {
      toast.error(err.message || "Create failed");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spinner size="sm" />
      </div>
    );
  }

  const statusOptions = [
    "Shipped Full",
    "Shipped Partial",
    "Not Shipped",
    "Shipped Over",
  ];

  return (
    <>
    <div className="flex justify-between">
 
      {/* ================= ADD BUTTON ================= */}
      <Modal>
        <Modal.Trigger>
        <Button variant="soft"  className="mb-4 bg-success-soft flex items-center gap-2 " slot="close">
            <Plus />
            Add New Shipment
          </Button>
        </Modal.Trigger>

        <Modal.Backdrop>
          <Modal.Container placement="center">
            <Modal.Dialog className="max-w-[900px] ">
              <Modal.Header>
                <Modal.Heading>Create Shipment</Modal.Heading>
              </Modal.Header>

              {/* ================= BODY ================= */}
              <Modal.Body >

                {/* 🔥 TWO COLUMN GRID */}
                <div className="grid grid-cols-2 gap-2 p-3">

                  {/* PLANT */}
                  <div>
                    <Label>Plant</Label>
                    <Autocomplete
                    variant="secondary"
                   
                      value={selectedPlant}
                      onChange={(value) => {
                        setSelectedPlant(value);
                        setForm((p) => ({ ...p, plant: value }));
                      }}
                    >
                      <Autocomplete.Trigger>
                        <Autocomplete.Value />
                      </Autocomplete.Trigger>

                      <Autocomplete.Popover>
                        <ListBox>
                          {plants.map((p) => (
                            <ListBox.Item
                              key={p._id}
                              id={p.name}
                              textValue={p.name}
                            >
                              {p.name}
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Autocomplete.Popover>
                    </Autocomplete>
                  </div>

                  {/* STATUS */}
                  <div>
                    <Label>Status</Label>
                    <Autocomplete
                      value={selectedStatus}
                      variant="secondary"
                      onChange={(value) => {
                        setSelectedStatus(value);
                        setForm((p) => ({ ...p, status: value }));
                      }}
                    >
                      <Autocomplete.Trigger>
                        <Autocomplete.Value />
                      </Autocomplete.Trigger>

                      <Autocomplete.Popover>
                        <ListBox>
                          {statusOptions.map((s) => (
                            <ListBox.Item key={s} id={s}>
                              {s}
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Autocomplete.Popover>
                    </Autocomplete>
                  </div>

                  {/* CUSTOMER */}
                  <div className="flex flex-col">
                  <Label>Customer</Label>
                  <Input
                    label="Customer"
                    variant="secondary"
                    onChange={(e) =>
                      setForm({ ...form, customer: e.target.value })
                    }
                  />
</div>
                  {/* ENG NUMBER (SKU) */}
                  <div>
                    <Label>Eng. # (SKU)</Label>
                    <Autocomplete
                      value={selectedSku}
                      variant="secondary"
                      onChange={(value) => {
                        setSelectedSku(value);
                        setForm((p) => ({ ...p, engNumber: value }));
                      }}
                    >
                      <Autocomplete.Trigger>
                        <Autocomplete.Value />
                      </Autocomplete.Trigger>

                      <Autocomplete.Popover>
                        <ListBox>
                          {skus.map((s) => (
                            <ListBox.Item
                              key={s._id}
                              id={s.skuId}
                              textValue={s.skuId}
                            >
                              {s.skuId} - {s.name}
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Autocomplete.Popover>
                    </Autocomplete>
                  </div>

                  {/* SAP PART */}
                  <div className="flex flex-col">
                  <Label>SAP Part</Label>
                  <Input
                    label="SAP Part"
                    variant="secondary"
                    onChange={(e) =>
                      setForm({ ...form, sapPart: e.target.value })
                    }
                  />
 </div>
                  {/* DESCRIPTION */}
                  <div className="flex flex-col">
                  <Label>Description</Label>
                  <Input
                    label="Description"
                    variant="secondary"
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
</div>
                  {/* PROJECTED QTY */}
                  <div className="flex flex-col">
                  <Label>Projected Qty</Label>
                  <Input
                    type="number"
                    variant="secondary"
                    label="Projected Qty"
                    onChange={(e) =>
                      setForm({ ...form, projectedQty: +e.target.value })
                    }
                  /></div>

                  {/* ACTUAL QTY */}
                  <div className="flex flex-col">
                  <Label>Actual Qty</Label>
                  <Input
                    type="number"
                    variant="secondary"
                    label="Actual Qty"
                    onChange={(e) =>
                      setForm({ ...form, actualQty: +e.target.value })
                    }
                  /></div>

                  {/* PRICE */}
                  <div className="flex flex-col">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    variant="secondary"
                    label="Price"
                    onChange={(e) =>
                      setForm({ ...form, price: +e.target.value })
                    }
                    /></div>

                  {/* PO NUMBER */}
                  <div className="flex flex-col">
                  <Label>PO Number</Label>
                  <Input
                    label="PO Number"
                    variant="secondary"
                    onChange={(e) =>
                      setForm({ ...form, poNumber: e.target.value })
                    }
                    /></div>

                  {/* SALES ORDER */}
                  <div className="flex flex-col">
                  <Label>Sales Order</Label>
                  <Input
                    label="Sales Order"
                    variant="secondary"
                    onChange={(e) =>
                      setForm({ ...form, salesOrder: e.target.value })
                    }
                    /></div>

                  {/* CARRIER */}
                  <div className="flex flex-col">
                  <Label>Carrier</Label>
                  <Input
                    label="Carrier"
                    variant="secondary"
                    onChange={(e) =>
                      setForm({ ...form, carrier: e.target.value })
                    }
                    /></div>

                  {/* LOAD NUMBER */}
                  <div className="flex flex-col">
                  <Label>Load #</Label>
                  <Input
                    label="Load #"
                    variant="secondary"
                    onChange={(e) =>
                      setForm({ ...form, loadNumber: e.target.value })
                    }
                    /></div>

                  {/* PICKUP TIME */}
                  <div className="flex flex-col">
                    <Label>Pickup Time</Label>

                    <DatePicker
  granularity="minute"
  hourCycle={24} // ✅ 24H FORMAT
  variant="secondary"
  onChange={(value) => {
    setPickupTime(value?.toString());
  }}
>
  {({ state }) => (
    <>
      <DateField.Group>
        <DateField.Input>
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>

        <DateField.Suffix>
          <DatePicker.Trigger>
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>

      <DatePicker.Popover>
        <Calendar>
          <Calendar.Grid>
            <Calendar.GridBody>
              {(date) => <Calendar.Cell date={date} />}
            </Calendar.GridBody>
          </Calendar.Grid>
        </Calendar>

        {/* 🔥 IMPORTANT PART */}
        <TimeField
          hourCycle={24}
          value={state.timeValue}
          onChange={(v) => state.setTimeValue(v)}
        >
          <TimeField.Group>
            <TimeField.Input>
              {(segment) => <TimeField.Segment segment={segment} />}
            </TimeField.Input>
          </TimeField.Group>
        </TimeField>
      </DatePicker.Popover>
    </>
  )}
</DatePicker>
                  </div>

                  {/* NOTES */}
                  <div className="flex flex-col">
                  <Label>Notes</Label>
                    <Input
                    variant="secondary"
                      label="Notes"
                      onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
                      }
                    />
                  </div>
                </div>
              </Modal.Body>

              {/* ================= FOOTER ================= */}
              <Modal.Footer>
                <Button variant="secondary" slot="close">
                  Cancel
                </Button>

                <Button onClick={handleAddShipment} slot="close">
                  Create Shipment
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
      <BulkShipments onSuccess={fetchShipments} />
      </div>
      <Kpi shipments={shipments} />
      <ShipmentsTable shipments={shipments}  onRefresh={fetchShipments}  />
    </>
  );
}