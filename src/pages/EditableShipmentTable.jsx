import React, { useState,useEffect } from "react";
import { Card, Table, Chip, Spinner, ComboBox,TextArea, Input, ListBox, Button } from "@heroui/react";
import { Pencil, Check, X } from "lucide-react";
import { toast } from "react-toastify";
import { Modal } from "@heroui/react";
import { useOverlayState } from "@heroui/react";
const STATUS_OPTIONS = [
  { id: "Shipped Full", name: "Shipped Full", color: "success" },
  { id: "Shipped Partial", name: "Shipped Partial", color: "warning" },
  { id: "Not Shipped", name: "Not Shipped", color: "danger" },
  { id: "Shipped Over", name: "Shipped Over", color: "accent" }
];

const getStatusColor = (status) => {
  const option = STATUS_OPTIONS.find(s => s.id === status);
  return option?.color || "default";
};

// Status cell - perfect as is
const StatusCell = ({ value, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(editValue);
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value || "");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-1 p-0 m-0">
        <div className="flex items-center gap-0">
          <ComboBox
            size="sm"
            selectedKey={editValue}
            onSelectionChange={(key) => setEditValue(key)}
            className="w-30 h-6 p-0 m-0"
            isDisabled={isSaving}
          >
            <ComboBox.InputGroup className="h-6 p-0 m-0">
              <Input 
                size="sm" 
                placeholder="Select status..." 
                className="h-5 p-1 m-0 text-xs"
                classNames={{
                  input: "h-6 p-0 m-0",
                  inputWrapper: "h-6 p-0 m-0 min-h-0"
                }}
              />
              <ComboBox.Trigger className="h-6 p-0 m-0" />
            </ComboBox.InputGroup>
            <ComboBox.Popover>
              <ListBox className="max-h-48">
                {STATUS_OPTIONS.map((option) => (
                  <ListBox.Item key={option.id} id={option.id} textValue={option.name}>
                    <Chip size="sm" color={option.color} variant="soft" className="w-full">
                      {option.name}
                    </Chip>
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </ComboBox.Popover>
          </ComboBox>
        </div>
        <div className="flex items-center justify-start gap-1">
          <Button 
            size="sm" 
            isIconOnly 
            variant="soft" 
            color="success" 
            onPress={handleSave}
            className="h-6 min-h-0 w-14 m-0 bg-success-soft"
            isLoading={isSaving}
          >
            {!isSaving && <Check size={12} />}
          </Button>
          <Button 
            size="sm" 
            isIconOnly 
            variant="soft" 
            color="danger" 
            onPress={handleCancel}
            className="h-6 min-h-0 w-14 m-0 bg-danger-soft"
            isDisabled={isSaving}
          >
            <X size={12} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <Chip
        size="sm"
        color={getStatusColor(value)}
        variant="soft"
        className="cursor-pointer"
        onClick={() => setIsEditing(true)}
      >
        {value || '—'}
      </Chip>
      <Button
        isIconOnly
        size="sm"
        variant="light"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        onPress={() => setIsEditing(true)}
      >
        <Pencil size={12} />
      </Button>
    </div>
  );
};

// Number cell - editable inline
const NumberCell = ({ value, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || 0);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const newValue = parseFloat(editValue) || 0;
    setIsSaving(true);
    await onSave(newValue);
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value || 0);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-1 p-0 m-0">
        <div className="flex items-center justify-end">
          <Input
            size="sm"
            type="number"
            value={String(editValue)}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-20 h-6 p-0 pl-5 m-0 text-xs"
            classNames={{
              input: "h-6 p-1 m-0 text-xs text-right",
              inputWrapper: "h-6 p-0 m-0 min-h-0"
            }}
            autoFocus
            isDisabled={isSaving}
          />
        </div>
        <div className="flex items-center justify-end gap-1">
          <Button 
            size="sm" 
            isIconOnly 
            variant="soft" 
            color="success" 
            onPress={handleSave}
            className="h-6 min-h-0 w-14 m-0 bg-success-soft"
            isLoading={isSaving}
          >
            {!isSaving && <Check size={12} />}
          </Button>
          <Button 
            size="sm" 
            isIconOnly 
            variant="soft" 
            color="danger" 
            onPress={handleCancel}
            className="h-6 min-h-0 w-14 m-0 bg-danger-soft"
            isDisabled={isSaving}
          >
            <X size={12} />
          </Button>
        </div>
      </div>
    );
  }

  const displayValue = value === 0 ? '0' : (value || '0');
  
  return (
    <div className="flex items-center justify-end gap-2 group">
      <span className="font-mono cursor-pointer" onClick={() => setIsEditing(true)}>
        {displayValue}
      </span>
      <Button
        isIconOnly
        size="sm"
        variant="light"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        onPress={() => setIsEditing(true)}
      >
        <Pencil size={12} />
      </Button>
    </div>
  );
};

// Text cell - editable inline
const TextCell = ({ value, onSave, isNarrow = false, isTextarea = false }) => {
  const state = useOverlayState({ defaultOpen: false });

  const [editValue, setEditValue] = useState(value || "");
  const [displayValue, setDisplayValue] = useState(value || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(false);

  // sync when parent updates (important after refresh)
  useEffect(() => {
    setDisplayValue(value || "");
    setError(false);
  }, [value]);

  const handleOpen = () => {
    setEditValue(displayValue || "");
    state.open();
  };

  const handleSave = (close) => {
    const newValue = editValue;

    // 🔥 instant UI update
    setDisplayValue(newValue);
    setError(false);

    close();

    setIsSaving(true);

    onSave(newValue)
      .then(() => {
        // success → do nothing (value already set)
      })
      .catch(() => {
        // ❌ show failed state
        setError(true);
        setDisplayValue("FAILED");
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <>
      {/* Trigger */}
      <div className="flex items-center gap-2 group">
        <span
          className={`truncate cursor-pointer ${
            error ? "text-red-500 font-medium" : ""
          }`}
          onClick={handleOpen}
        >
          {displayValue || "—"}
        </span>

        <Button
          isIconOnly
          size="sm"
          variant="light"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onPress={handleOpen}
        >
          <Pencil size={12} />
        </Button>
      </div>

      {/* Modal */}
      <Modal >
        <Modal.Backdrop
          isOpen={state.isOpen}
          onOpenChange={state.setOpen}
        >
          <Modal.Container placement="center" size={isTextarea ? "md" : "sm"}>
            <Modal.Dialog>
              {({ close }) => (
                <>
                  <Modal.CloseTrigger />


                  <Modal.Body className="p-0 m-0">
                    {isTextarea ? (
                      <TextArea
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        minRows={4}
                        isDisabled={isSaving}
                        className="p-2 m-3 w-[90%]"
                      />
                    ) : (
                      <Input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        isDisabled={isSaving}
                        className="p-2 m-3 w-[90%]"
                      />
                    )}
                  </Modal.Body>

                  <Modal.Footer>
                    <Button
                      variant="light"
                      onPress={close}
                      isDisabled={isSaving}
                    >
                      Cancel
                    </Button>

                    <Button
                      color="success"
                      onPress={() => handleSave(close)}
                    >
                      Save
                    </Button>
                  </Modal.Footer>
                </>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
};

function EditableShipmentTable({ shipments, selectedDate, PLANT_ORDER, formatCurrency, tableLoading, onRefresh }) {
  // Group shipments by plant with filtered data
  let currentShipments = shipments;
  if (selectedDate) {
    currentShipments = shipments.filter(s => {
      if (!s.pickupTime) return false;
      const shipmentDate = new Date(s.pickupTime).toISOString().split('T')[0];
      return shipmentDate === selectedDate;
    });
  }
  
  const shipmentsByPlant = {};
  
  // First, add all plants from PLANT_ORDER
  PLANT_ORDER.forEach(plant => {
    shipmentsByPlant[plant] = currentShipments.filter(s => s.plant === plant);
  });
  
  // Then add any other plants that exist in shipments but not in PLANT_ORDER
  const otherPlants = [...new Set(currentShipments.map(s => s.plant).filter(p => p && !PLANT_ORDER.includes(p)))];
  otherPlants.sort();
  otherPlants.forEach(plant => {
    shipmentsByPlant[plant] = currentShipments.filter(s => s.plant === plant);
  });

  // Build rows array with 6 rows per plant + total row
  const allRows = [];
  const orderedPlants = [...PLANT_ORDER, ...otherPlants];
  
  orderedPlants.forEach(plant => {
    const plantShipments = shipmentsByPlant[plant] || [];
    const rowsToShow = Math.max(6, plantShipments.length);
    
    for (let i = 0; i < rowsToShow; i++) {
      if (i < plantShipments.length) {
        const shipment = plantShipments[i];
        const projectedValue = (shipment.projectedQty || 0) * (shipment.price || 0);
        const actualValue = (shipment.actualQty || 0) * (shipment.price || 0);
        
        allRows.push({
          key: `${plant}-row-${i}`,
          type: 'shipment',
          shipmentId: shipment._id,
          plant: shipment.plant || "-",
          status: shipment.status,
          customer: shipment.customer,
          engNumber: shipment.engNumber,
          sapPart: shipment.sapPart,
          description: shipment.description,
          projQty: shipment.projectedQty || 0,
          actQty: shipment.actualQty || 0,
          price: shipment.price,
          projValue: projectedValue,
          actValue: actualValue,
          poNumber: shipment.poNumber,
          salesOrder: shipment.salesOrder,
          carrier: shipment.carrier,
          pickupTime: shipment.pickupTime,
          notes: shipment.notes,
          // Store original shipment data for updates
          originalShipment: shipment
        });
      } else {
        // Empty row
        allRows.push({
          key: `${plant}-empty-${i}`,
          type: 'empty',
          plant: '',
          status: '',
          customer: '',
          engNumber: '',
          sapPart: '',
          description: '',
          projQty: '',
          actQty: '',
          price: '',
          projValue: '',
          actValue: '',
          poNumber: '',
          salesOrder: '',
          carrier: '',
          pickupTime: '',
          notes: ''
        });
      }
    }
    
    // Calculate plant totals
    let plantTotalProj = 0;
    let plantTotalAct = 0;
    plantShipments.forEach(s => {
      plantTotalProj += (s.projectedQty || 0) * (s.price || 0);
      plantTotalAct += (s.actualQty || 0) * (s.price || 0);
    });
    
    if (plantShipments.length > 0 || PLANT_ORDER.includes(plant)) {
      allRows.push({
        key: `${plant}-total`,
        type: 'total',
        plant: `${plant} Total`,
        status: '',
        customer: '',
        engNumber: '',
        sapPart: '',
        description: '',
        projQty: '',
        actQty: '',
        price: '',
        projValue: plantTotalProj,
        actValue: plantTotalAct,
        poNumber: '',
        salesOrder: '',
        carrier: '',
        pickupTime: '',
        notes: ''
      });
    }
  });

  // Update shipment function with API call
  const handleUpdateShipment = async (shipmentId, field, newValue) => {
    try {
      // Find the original shipment to get all its data
      const originalShipment = shipments.find(s => s._id === shipmentId);
      if (!originalShipment) {
        toast.error("Shipment not found");
        return;
      }
      
      // Create updated shipment object with the new value
      const updatedShipment = {
        ...originalShipment,
        [field]: newValue
      };
      
      // Send PUT request to update the shipment
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shipments/${shipmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedShipment)
      });
      
      if (!response.ok) {
        throw new Error("Update failed");
      }
      
      toast.success(`${field} updated successfully`);
      
      // Refresh the data if onRefresh prop is provided
      if (onRefresh) {
        await onRefresh();
      }
      
    } catch (error) {
      console.error("Error updating shipment:", error);
      toast.error(`Failed to update ${field}`);
    }
  };

  return (
    <Card className="overflow-hidden shadow-none border-0">
      <Card.Content>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Shipment Details</h3>
          <p className="text-sm text-gray-500 mt-1">Complete shipment history with line items - Click the pencil icon or text to edit</p>
          {tableLoading && (
            <div className="flex items-center gap-2 mt-2">
              <Spinner size="sm" />
              <span className="text-sm text-gray-500">Loading...</span>
            </div>
          )}
        </div>
        
        {tableLoading ? (
          <div className="flex justify-center items-center h-96">
            <Spinner size="lg" />
          </div>
        ) : (
          <Table aria-label="Shipment details table">
            <Table.ScrollContainer className="max-h-[600px]">
              <Table.Content className="min-w-[2000px] table-fixed" style={{ tableLayout: 'fixed' }}>
                <Table.Header>
                  <Table.Column isRowHeader className="bg-gray-100 font-bold text-gray-700 px-3 py-1 w-[100px]">Plant</Table.Column>
                  <Table.Column className="bg-gray-100 font-bold text-gray-700 px-3 py-1 w-[130px]">Status</Table.Column>
                  <Table.Column className="bg-gray-100 font-bold text-gray-700 px-3 py-1 w-[120px]">Customer</Table.Column>
                  <Table.Column className="bg-gray-100 font-bold text-gray-700 px-3 py-1 w-[100px]">Eng. #</Table.Column>
                  <Table.Column className="bg-gray-100 font-bold text-gray-700 px-3 py-1 w-[100px]">SAP Part</Table.Column>
                  <Table.Column className="bg-gray-100 font-bold text-gray-700 px-3 py-1 w-[300px]">Description</Table.Column>
                  <Table.Column align="end" className="bg-gray-100 font-bold text-gray-700 px-3 py-1 w-[100px]">Proj Qty</Table.Column>
                  <Table.Column align="end" className="bg-gray-100 font-bold text-gray-700 px-3 py-1 w-[100px]">Act Qty</Table.Column>
                  <Table.Column align="end" className="bg-gray-100 font-bold text-gray-700 px-3 py-1 w-[100px]">Price</Table.Column>
                  <Table.Column align="end" className="bg-gray-100 font-bold text-gray-700 px-3 py-1 w-[120px]">Proj ($)</Table.Column>
                  <Table.Column align="end" className="bg-gray-100 font-bold text-gray-700 px-3 py-1 w-[120px]">Act ($)</Table.Column>
                  <Table.Column className="bg-gray-100 font-bold text-gray-700 px-3 py-1 w-[120px]">PO Number</Table.Column>
                  <Table.Column className="bg-gray-100 font-bold text-gray-700 px-3 py-1 w-[120px]">Sales Order</Table.Column>
                  <Table.Column className="bg-gray-100 font-bold text-gray-700 px-3 py-1 w-[120px]">Carrier</Table.Column>
                  <Table.Column className="bg-gray-100 font-bold text-gray-700 px-3 py-1 w-[100px]">Time</Table.Column>
                  <Table.Column className="bg-gray-100 font-bold text-gray-700 px-3 py-1 w-[200px]">Notes</Table.Column>
                </Table.Header>

                <Table.Body renderEmptyState={() => <div className="text-center py-8 text-gray-500">No shipments found for the selected criteria</div>}>
                  <Table.Collection items={allRows}>
                    {(row) => (
                      <Table.Row 
                        key={row.key} 
                        className={row.type === 'total' ? 'bg-green-50 border-t-2 border-green-200 hover:bg-green-100' : 
                                     row.type === 'empty' ? 'bg-gray-50 italic text-gray-400' : 
                                     'hover:bg-amber-50 transition-colors group'}
                      >
                        <Table.Cell className={`${row.type === 'total' ? 'font-bold text-green-700' : 'font-medium text-gray-900'} px-3 py-1`}>
                          {row.plant}
                        </Table.Cell>
                        <Table.Cell className="px-3 py-1">
                          {row.type === 'shipment' ? (
                            <StatusCell
                              value={row.status}
                              onSave={(newValue) => handleUpdateShipment(row.shipmentId, 'status', newValue)}
                            />
                          ) : row.type === 'empty' ? '—' : ''}
                        </Table.Cell>
                        <Table.Cell className="px-3 py-1">
                          {row.type === 'shipment' ? row.customer || '-' : (row.type === 'empty' ? '—' : '')}
                        </Table.Cell>
                        <Table.Cell className="px-3 py-1">
                          {row.type === 'shipment' ? row.engNumber || '-' : (row.type === 'empty' ? '—' : '')}
                        </Table.Cell>
                        <Table.Cell className="px-3 py-1">
                          {row.type === 'shipment' ? row.sapPart || '-' : (row.type === 'empty' ? '—' : '')}
                        </Table.Cell>
                        <Table.Cell className="max-w-xs truncate px-3 py-1" title={row.description}>
                          {row.type === 'shipment' ? (row.description?.substring(0, 50) || "-") : (row.type === 'empty' ? '—' : '')}
                        </Table.Cell>
                        <Table.Cell align="end" className="px-3 py-1">
                          {row.type === 'shipment' ? (
                            <NumberCell
                              value={row.projQty}
                              onSave={(newValue) => handleUpdateShipment(row.shipmentId, 'projectedQty', newValue)}
                            />
                          ) : row.type === 'empty' ? '—' : ''}
                        </Table.Cell>
                        <Table.Cell align="end" className="px-3 py-1">
                          {row.type === 'shipment' ? (
                            <NumberCell
                              value={row.actQty}
                              onSave={(newValue) => handleUpdateShipment(row.shipmentId, 'actualQty', newValue)}
                            />
                          ) : row.type === 'empty' ? '—' : ''}
                        </Table.Cell>
                        <Table.Cell align="end" className="px-3 py-1">
                          {row.type === 'shipment' ? formatCurrency(row.price) : (row.type === 'empty' ? '—' : '')}
                        </Table.Cell>
                        <Table.Cell align="end" className={`${row.type === 'total' ? 'font-bold text-blue-700' : 'text-blue-600 font-medium'} px-3 py-1`}>
                          {row.type === 'shipment' ? formatCurrency(row.projValue) : 
                           row.type === 'total' ? formatCurrency(row.projValue) : '—'}
                        </Table.Cell>
                        <Table.Cell align="end" className={`${row.type === 'total' ? 'font-bold text-green-700' : 'text-green-600 font-medium'} px-3 py-1`}>
                          {row.type === 'shipment' ? formatCurrency(row.actValue) : 
                           row.type === 'total' ? formatCurrency(row.actValue) : '—'}
                        </Table.Cell>
                        <Table.Cell className="px-3 py-1">
                          {row.type === 'shipment' ? (
                            <TextCell
                              value={row.poNumber}
                              onSave={(newValue) => handleUpdateShipment(row.shipmentId, 'poNumber', newValue)}
                              isNarrow={true}
                            />
                          ) : row.type === 'empty' ? '—' : ''}
                        </Table.Cell>
                        <Table.Cell className="px-3 py-1">
                          {row.type === 'shipment' ? (
                            <TextCell
                              value={row.salesOrder}
                              onSave={(newValue) => handleUpdateShipment(row.shipmentId, 'salesOrder', newValue)}
                              isNarrow={true}
                            />
                          ) : row.type === 'empty' ? '—' : ''}
                        </Table.Cell>
                        <Table.Cell className="px-3 py-1">
                          {row.type === 'shipment' ? (
                            <TextCell
                              value={row.carrier}
                              onSave={(newValue) => handleUpdateShipment(row.shipmentId, 'carrier', newValue)}
                              isNarrow={true}
                            />
                          ) : row.type === 'empty' ? '—' : ''}
                        </Table.Cell>
                        <Table.Cell className="px-3 py-1">
                          {row.type === 'shipment' && row.pickupTime ? new Date(row.pickupTime).toLocaleDateString() : (row.type === 'empty' ? '—' : '')}
                        </Table.Cell>
                        <Table.Cell className="max-w-xs truncate px-3 py-1" title={row.notes}>
                          {row.type === 'shipment' ? (
                            <TextCell
                              value={row.notes}
                              onSave={(newValue) => handleUpdateShipment(row.shipmentId, 'notes', newValue)}
                              isTextarea={true}
                            />
                          ) : row.type === 'empty' ? '—' : ''}
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Collection>
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        )}
      </Card.Content>
    </Card>
  );
}

export default EditableShipmentTable;