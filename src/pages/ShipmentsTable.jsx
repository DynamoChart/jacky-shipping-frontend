"use client";


import {
  Table,
  Spinner,
  EmptyState,
  Chip,
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
  SearchField,
  Checkbox,
  CheckboxGroup,
  DateRangePicker,
  RangeCalendar
} from "@heroui/react";

import { useEffect, useState } from "react";
import { Drawer } from "@heroui/react";
import { Pencil, Ellipsis,TrashBin } from "@gravity-ui/icons";
import { toast } from "react-toastify";

export default function ShipmentsTable({ shipments , onRefresh }) {



  const [plants, setPlants] = useState([]);
  const [skus, setSkus] = useState([]);
  const [drawerItem, setDrawerItem] = useState(null);
  const [selected, setSelected] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [selectedSku, setSelectedSku] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [pickupTime, setPickupTime] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState("");

  const [selectedStatuses, setSelectedStatuses] = useState([
    "Shipped Full",
    "Shipped Partial",
    "Not Shipped",
    "Shipped Over",
  ]);
  
  const [dateRange, setDateRange] = useState(null);
  const statusOptions = [
    "Shipped Full",
    "Shipped Partial",
    "Not Shipped",
    "Shipped Over",
  ];
  const statusColorMap = {
    "Shipped Full": "success",
    "Shipped Partial": "warning",
    "Not Shipped": "danger",
    "Shipped Over": "accent",
  };


  const filteredShipments = shipments.filter((s) => {
    // ================= SEARCH =================
    const matchesSearch =
      search === "" ||
      s.customer?.toLowerCase().includes(search.toLowerCase()) ||
      s.engNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.sapPart?.toLowerCase().includes(search.toLowerCase());
  
    // ================= STATUS FILTER =================
    const matchesStatus = selectedStatuses.includes(s.status);
  
    // ================= DATE RANGE =================
    const matchesDate =
  !dateRange?.start ||
  !dateRange?.end ||
  !s.pickupTime ||
  (new Date(s.pickupTime) >= new Date(dateRange.start)) &&
  (new Date(s.pickupTime) <= new Date(dateRange.end));
  
    return matchesSearch && matchesStatus && matchesDate;
  });
  // ================= UPDATE =================
  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/shipments/${selected._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            pickupTime,
          }),
        }
      );

      if (!res.ok) throw new Error();

      toast.success("Updated");
      setSelected(null);
      await onRefresh(); 
    } catch {
      toast.error("Update failed");
    }
  };
  const clearDateRange = () => {
    setDateRange(null);
  };
  // ================= DELETE =================
  const handleDelete = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/shipments/${deleteId}`, {
        method: "DELETE",
      });

      toast.success("Deleted");
      setDeleteId(null);
      await onRefresh(); 
    } catch {
      toast.error("Delete failed");
    }
  };
  console.log("SHIPMENTS:", shipments);
  
  return (
    <>
    <div className="flex justify-between">
 <SearchField
  className="w-[280px] mb-4"
  value={search}
  onChange={setSearch}
>
 

  <SearchField.Group>
    <SearchField.SearchIcon />
    <SearchField.Input placeholder="Search customer, ENG, SAP..." />
    <SearchField.ClearButton />
  </SearchField.Group>
</SearchField>

<CheckboxGroup
  className="flex flex-row items-center gap-4 mb-4"
  value={selectedStatuses}
  onChange={setSelectedStatuses}
>
  {[
    "Shipped Full",
    "Shipped Partial",
    "Not Shipped",
    "Shipped Over",
  ].map((status) => (
    <Checkbox
      key={status}
      value={status}
      className="flex items-center gap-2 whitespace-nowrap"
    >
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>

      <Checkbox.Content>
        <Label className="text-sm">{status}</Label>
      </Checkbox.Content>
    </Checkbox>
  ))}
</CheckboxGroup>
<div className="flex items-end gap-2 mb-4">

  <DateRangePicker
    className="w-72"
    onChange={(value) => {
      setDateRange(value);
    }}
  >
  

    <DateField.Group fullWidth>
      <DateField.InputContainer>
        <DateField.Input slot="start">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>

        <DateRangePicker.RangeSeparator />

        <DateField.Input slot="end">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
      </DateField.InputContainer>

      <DateField.Suffix>
        <DateRangePicker.Trigger>
          <DateRangePicker.TriggerIndicator />
        </DateRangePicker.Trigger>
      </DateField.Suffix>
    </DateField.Group>

    <DateRangePicker.Popover>
      <RangeCalendar aria-label="Pickup range">
        <RangeCalendar.Header>
          <RangeCalendar.YearPickerTrigger>
            <RangeCalendar.YearPickerTriggerHeading />
            <RangeCalendar.YearPickerTriggerIndicator />
          </RangeCalendar.YearPickerTrigger>

          <RangeCalendar.NavButton slot="previous" />
          <RangeCalendar.NavButton slot="next" />
        </RangeCalendar.Header>

        <RangeCalendar.Grid>
          <RangeCalendar.GridHeader>
            {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
          </RangeCalendar.GridHeader>

          <RangeCalendar.GridBody>
            {(date) => <RangeCalendar.Cell date={date} />}
          </RangeCalendar.GridBody>
        </RangeCalendar.Grid>
      </RangeCalendar>
    </DateRangePicker.Popover>
  </DateRangePicker>

  {/* CLEAR BUTTON */}
  {dateRange && (
    <Chip
      onClick={clearDateRange}
    variant="soft"
    color="success"
    className="hover:cursor-pointer"
    >
      ✕ Clear
    </Chip>
  )}

</div>

</div>




      {/* ================= TABLE ================= */}
      <Table aria-label="Shipments table">
  <Table.ScrollContainer className="max-h-[500px]">
    <Table.Content className="min-w-[1400px]">
      <Table.Header>
        <Table.Column isRowHeader className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Plant</Table.Column>
        <Table.Column className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Status</Table.Column>
        <Table.Column className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Customer</Table.Column>
        <Table.Column className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Eng #</Table.Column>
        <Table.Column className="bg-gray-100 font-bold text-gray-700 px-3 py-1">SAP</Table.Column>
        <Table.Column align="end" className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Proj Qty</Table.Column>
        <Table.Column align="end" className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Act Qty</Table.Column>
        <Table.Column align="end" className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Price</Table.Column>
        <Table.Column className="bg-gray-100 font-bold text-gray-700 px-3 py-1">PO</Table.Column>
        <Table.Column className="bg-gray-100 font-bold text-gray-700 px-3 py-1">SO</Table.Column>
        <Table.Column className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Load</Table.Column>
        <Table.Column className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Pickup</Table.Column>
        <Table.Column className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Actions</Table.Column>
      </Table.Header>

      <Table.Body renderEmptyState={() => <div className="text-center py-8 text-gray-500">No shipments found</div>}>
        <Table.Collection
          items={(filteredShipments || []).map((s) => ({
            ...s,
            key: s._id,
          }))}
        >
          {(s) => (
            <Table.Row key={s.key} className="hover:bg-amber-50 transition-colors">
              <Table.Cell className="font-medium text-gray-800 px-3 py-1">
                {s.plant}
              </Table.Cell>
              <Table.Cell className="px-3 py-1">
                <Chip color={statusColorMap[s.status] || "default"} variant="soft" size="sm">
                  {s.status}
                </Chip>
              </Table.Cell>
              <Table.Cell className="px-3 py-1">{s.customer}</Table.Cell>
              <Table.Cell className="px-3 py-1">{s.engNumber}</Table.Cell>
              <Table.Cell className="px-3 py-1">{s.sapPart}</Table.Cell>
              <Table.Cell align="end" className="px-3 py-1">{s.projectedQty}</Table.Cell>
              <Table.Cell align="end" className="px-3 py-1">{s.actualQty}</Table.Cell>
              <Table.Cell align="end" className="px-3 py-1">{s.price}</Table.Cell>
              <Table.Cell className="px-3 py-1">{s.poNumber}</Table.Cell>
              <Table.Cell className="px-3 py-1">{s.salesOrder}</Table.Cell>
              <Table.Cell className="px-3 py-1">{s.loadNumber}</Table.Cell>
              <Table.Cell className="px-3 py-1">
                {s.pickupTime
                  ? new Date(s.pickupTime).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                      hourCycle: "h23",
                    })
                  : "-"}
              </Table.Cell>
              <Table.Cell className="px-3 py-1">
                <div className="flex gap-2">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="soft"
                    onPress={() => setDrawerItem(s)}
                    className="h-6 min-h-0 w-6"
                  >
                    <Ellipsis size={14} />
                  </Button>
                  <button
                    onClick={() => {
                      setSelected(s);
                      setForm(s);
                      setSelectedPlant(s.plant);
                      setSelectedSku(s.engNumber);
                      setSelectedStatus(s.status);
                      setPickupTime(s.pickupTime);
                    }}
                    className="hover:opacity-70"
                  >
                    <Pencil size={14} className="cursor-pointer" />
                  </button>
                  <button onClick={() => setDeleteId(s._id)} className="hover:opacity-70">
                    <TrashBin size={14} className="cursor-pointer" />
                  </button>
                </div>
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Collection>
      </Table.Body>
    </Table.Content>
  </Table.ScrollContainer>
</Table>





      {drawerItem && (
  <Drawer>
    <Drawer.Backdrop isOpen onOpenChange={() => setDrawerItem(null)}>
      <Drawer.Content placement="right">
        <Drawer.Dialog className="w-[450px]">

          <Drawer.Header>
            <Drawer.Heading>
              Shipment Details
            </Drawer.Heading>
          </Drawer.Header>

          <Drawer.Body className="space-y-4">

            <div>
              <Label>Plant</Label>
              <p>{drawerItem.plant}</p>
            </div>

            <div>
              <Label>Status</Label>
              <Chip color={statusColorMap[drawerItem.status] || "default"}>
                {drawerItem.status}
              </Chip>
            </div>

            <div>
              <Label>Description</Label>
              <p>{drawerItem.description}</p>
            </div>

            <div>
              <Label>Carrier</Label>
              <p>{drawerItem.carrier}</p>
            </div>

            <div>
              <Label>SAP Part</Label>
              <p>{drawerItem.sapPart}</p>
            </div>

            <div>
              <Label>Notes</Label>
              <p>{drawerItem.notes}</p>
            </div>

            <div>
              <Label>Pickup Time</Label>
              <p>
  {drawerItem.pickupTime
    ? new Date(drawerItem.pickupTime).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      })
    : "-"}
</p>
            </div>

          </Drawer.Body>

          <Drawer.Footer>
            <Button
              variant="secondary"
              slot="close"
              onPress={() => setDrawerItem(null)}
            >
              Close
            </Button>

            <Button
              slot="close"
              onPress={() => {
                setSelected(drawerItem);
                setDrawerItem(null);
              }}
            >
              Edit
            </Button>
          </Drawer.Footer>

        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  </Drawer>
)}
      {/* ================= EDIT MODAL (SAME STYLE AS CREATE) ================= */}
      {selected && (
        <Modal>
          <Modal.Backdrop isOpen onOpenChange={() => setSelected(null)}>
            <Modal.Container placement="center">
              <Modal.Dialog className="max-w-[900px]">

                <Modal.Header>
                  <Modal.Heading>Edit Shipment</Modal.Heading>
                </Modal.Header>

                <Modal.Body>
                <div className="grid grid-cols-2 gap-2 p-3">

  {/* PLANT */}
  <div>
    <Label>Plant</Label>
    <Autocomplete
      value={selectedPlant}
      variant="secondary"
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
            <ListBox.Item key={p._id} id={p.name}>
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
      variant="secondary"
      value={form.customer || ""}
      onChange={(e) =>
        setForm({ ...form, customer: e.target.value })
      }
    />
  </div>

  {/* SKU */}
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
            <ListBox.Item key={s._id} id={s.skuId}>
              {s.skuId} - {s.name}
            </ListBox.Item>
          ))}
        </ListBox>
      </Autocomplete.Popover>
    </Autocomplete>
  </div>

  {/* SAP */}
  <div className="flex flex-col">
    <Label>SAP Part</Label>
    <Input
      variant="secondary"
      value={form.sapPart || ""}
      onChange={(e) =>
        setForm({ ...form, sapPart: e.target.value })
      }
    />
  </div>

  {/* DESCRIPTION */}
  <div className="flex flex-col">
    <Label>Description</Label>
    <Input
      variant="secondary"
      value={form.description || ""}
      onChange={(e) =>
        setForm({ ...form, description: e.target.value })
      }
    />
  </div>

  {/* PROJECTED */}
  <div className="flex flex-col">
    <Label>Projected Qty</Label>
    <Input
      type="number"
      variant="secondary"
      value={form.projectedQty || 0}
      onChange={(e) =>
        setForm({ ...form, projectedQty: +e.target.value })
      }
    />
  </div>

  {/* ACTUAL */}
  <div className="flex flex-col">
    <Label>Actual Qty</Label>
    <Input
      type="number"
      variant="secondary"
      value={form.actualQty || 0}
      onChange={(e) =>
        setForm({ ...form, actualQty: +e.target.value })
      }
    />
  </div>

  {/* PRICE */}
  <div className="flex flex-col">
    <Label>Price</Label>
    <Input
      type="number"
      variant="secondary"
      value={form.price || 0}
      onChange={(e) =>
        setForm({ ...form, price: +e.target.value })
      }
    />
  </div>

  {/* PO */}
  <div className="flex flex-col">
    <Label>PO Number</Label>
    <Input
      variant="secondary"
      value={form.poNumber || ""}
      onChange={(e) =>
        setForm({ ...form, poNumber: e.target.value })
      }
    />
  </div>

  {/* SO */}
  <div className="flex flex-col">
    <Label>Sales Order</Label>
    <Input
      variant="secondary"
      value={form.salesOrder || ""}
      onChange={(e) =>
        setForm({ ...form, salesOrder: e.target.value })
      }
    />
  </div>

  {/* CARRIER */}
  <div className="flex flex-col">
    <Label>Carrier</Label>
    <Input
      variant="secondary"
      value={form.carrier || ""}
      onChange={(e) =>
        setForm({ ...form, carrier: e.target.value })
      }
    />
  </div>

  {/* LOAD */}
  <div className="flex flex-col">
    <Label>Load #</Label>
    <Input
      variant="secondary"
      value={form.loadNumber || ""}
      onChange={(e) =>
        setForm({ ...form, loadNumber: e.target.value })
      }
    />
  </div>

  {/* PICKUP */}
  <div className="flex flex-col">
    <Label>Pickup Time</Label>

    <DatePicker
      granularity="minute"
      hourCycle={24}
      variant="secondary"
      onChange={(value) => {
        setPickupTime(value?.toString());
        setForm((p) => ({ ...p, pickupTime: value?.toString() }));
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
      value={form.notes || ""}
      onChange={(e) =>
        setForm({ ...form, notes: e.target.value })
      }
    />
  </div>

</div>
                </Modal.Body>

                <Modal.Footer>
                  <Button onClick={handleUpdate}>Save</Button>
                </Modal.Footer>

              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      )}

      {/* ================= DELETE ================= */}
      {deleteId && (
        <Modal>
          <Modal.Backdrop isOpen onOpenChange={() => setDeleteId(null)}>
            <Modal.Container>
              <Modal.Dialog>
                <Modal.Header>
                  <Modal.Heading>Delete Shipment?</Modal.Heading>
                </Modal.Header>

                <Modal.Footer>
                  <Button onClick={handleDelete}>Delete</Button>
                </Modal.Footer>

              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      )}
    </>
  );
}