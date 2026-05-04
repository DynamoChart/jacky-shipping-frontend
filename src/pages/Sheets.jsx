
import React, { useEffect, useState } from "react";
import { Card, Table, Chip, Spinner, TagGroup, Tag, Button } from "@heroui/react";
import { TrendingUp, TrendingDown, Minus, Calendar, X } from "lucide-react";
import DescriptionSummary from "./DescriptionSummary";
function Sheets({isDark}) {
  const [shipments, setShipments] = useState([]);
const [plantsList, setPlantsList] = useState([]);
const [loading, setLoading] = useState(true);
const [plantSummary, setPlantSummary] = useState([]);
const [tableLoading, setTableLoading] = useState(false);
const PLANT_ORDER = ["MK", "LM", "CROWLEY", "ME", "GA", "CA"];
const [currentMonth, setCurrentMonth] = useState(new Date());
const [selectedDate, setSelectedDate] = useState(null); // null = all dates, or specific date string
const [availableDates, setAvailableDates] = useState([]);
const [totals, setTotals] = useState({
    projected: 0,
    actual: 0,
    variance: 0,
    percentage: 0,
  });

  useEffect(() => {
    Promise.all([fetchShipments(), fetchPlants()]);
  }, []);

  const fetchShipments = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shipments`);
      const data = await response.json();
      setShipments(data);
    } catch (error) {
      console.error("Error fetching shipments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique pickup dates from shipments
const getAvailableDates = (shipmentsData) => {
  const dates = new Set();
  shipmentsData.forEach(s => {
    if (s.pickupTime) {
      const date = new Date(s.pickupTime).toISOString().split('T')[0];
      dates.add(date);
    }
  });
  return Array.from(dates).sort();
};

// Month navigation
const goToPreviousMonth = () => {
  const newDate = new Date(currentMonth);
  newDate.setMonth(currentMonth.getMonth() - 1);
  setCurrentMonth(newDate);
  setSelectedDate(null); // Clear selection when changing month
};

const goToNextMonth = () => {
  const newDate = new Date(currentMonth);
  newDate.setMonth(currentMonth.getMonth() + 1);
  setCurrentMonth(newDate);
  setSelectedDate(null); // Clear selection when changing month
};

// Clear date filter
const clearDateFilter = () => {
  setSelectedDate(null);
};

// Format month display
const formatMonthDisplay = () => {
  return currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
};

// Get days in current month
const getDaysInMonth = () => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({
      day: i,
      date: dateStr,
      hasData: availableDates.includes(dateStr)
    });
  }
  return days;
};
  const fetchPlants = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/plants`);
      const data = await response.json();
      const plantNames = data.map(plant => plant.name);
      setPlantsList(plantNames);
    } catch (error) {
      console.error("Error fetching plants:", error);
    }
  };
  const calculateSummaries = (data, plants) => {
    // Calculate totals
    let totalProjected = 0;
    let totalActual = 0;
  
    data.forEach((s) => {
      const projectedValue = (s.projectedQty || 0) * (s.price || 0);
      const actualValue = (s.actualQty || 0) * (s.price || 0);
      totalProjected += projectedValue;
      totalActual += actualValue;
    });
  
    const variance = totalActual - totalProjected;
    const percentage = totalProjected > 0 ? (totalActual / totalProjected) * 100 : 0;
  
    setTotals({
      projected: totalProjected,
      actual: totalActual,
      variance: variance,
      percentage: percentage,
    });
  
    // Calculate plant-wise summary with ALL plants
    const plantMap = new Map();
  
    // Initialize ALL plants with zero values
    plants.forEach(plant => {
      plantMap.set(plant, { projected: 0, actual: 0 });
    });
  
    // Fill in actual data where it exists
    data.forEach((s) => {
      const plant = s.plant || "Unknown";
      if (plants.includes(plant)) {
        const projectedValue = (s.projectedQty || 0) * (s.price || 0);
        const actualValue = (s.actualQty || 0) * (s.price || 0);
        
        const current = plantMap.get(plant);
        current.projected += projectedValue;
        current.actual += actualValue;
      }
    });
  
    const plantArray = Array.from(plantMap.entries()).map(([plant, values]) => ({
      plant,
      projected: values.projected,
      actual: values.actual,
      variance: values.actual - values.projected,
      percentage: values.projected > 0 ? (values.actual / values.projected) * 100 : 0,
    }));
  
    // After setPlantSummary(plantArray); replace with this:
const sortedPlantArray = plantArray.sort((a, b) => b.projected - a.projected);
setPlantSummary(sortedPlantArray);
  };
  useEffect(() => {
    const updateData = async () => {
      setTableLoading(true);
      
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (shipments.length > 0 && plantsList.length > 0) {
        // Filter shipments by selected date if needed
        let filteredShipments = shipments;
        if (selectedDate) {
          filteredShipments = shipments.filter(s => {
            if (!s.pickupTime) return false;
            const shipmentDate = new Date(s.pickupTime).toISOString().split('T')[0];
            return shipmentDate === selectedDate;
          });
        }
        calculateSummaries(filteredShipments, plantsList);
        
        // Update available dates
        setAvailableDates(getAvailableDates(shipments));
      } else if (shipments.length > 0 && plantsList.length === 0) {
        let filteredShipments = shipments;
        if (selectedDate) {
          filteredShipments = shipments.filter(s => {
            if (!s.pickupTime) return false;
            const shipmentDate = new Date(s.pickupTime).toISOString().split('T')[0];
            return shipmentDate === selectedDate;
          });
        }
        calculateSummaries(filteredShipments, [...new Set(shipments.map(s => s.plant).filter(Boolean))]);
      }
      
      setTableLoading(false);
    };
    
    updateData();
  }, [shipments, plantsList, selectedDate]);
  const formatCurrency = (value) => {
    if (value === 0) return "$ -";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const getTrendIcon = (value) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return "text-green-700 bg-green-50";
    if (percentage >= 70) return "text-yellow-700 bg-yellow-50";
    if (percentage >= 50) return "text-orange-700 bg-orange-50";
    if (percentage > 0) return "text-red-700 bg-red-50";
    return "text-gray-500 bg-gray-50";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex gap-0 p-0">
      {/* Left Sidebar - Vertical Date Picker */}
      <Card className={`overflow-hidden shadow-none border ${isDark ? "border-gray-800" : "border-gray-200"} w-32`}>
        <Card.Content className="p-0">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-2">
            <Button
              size="sm"
              variant="flat"
              onPress={goToPreviousMonth}
              className="min-w-6 w-6 h-6 p-0"
            >
              ←
            </Button>
            <h3 className={`text-xs ${isDark ? "text-white" : "text-gray-900"} font-semibold text-center`}>
              {formatMonthDisplay()}
            </h3>
            <Button
              size="sm"
              variant="flat"
              onPress={goToNextMonth}
              className="min-w-6 w-6 h-6 p-0"
            >
              →
            </Button>
          </div>
          
          {/* Vertical Date Tags */}
          <TagGroup 
            aria-label="Date selection" 
            selectionMode="single"
            selectedKeys={selectedDate ? [selectedDate] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0];
              setSelectedDate(selected || null);
            }}
          >
            <TagGroup.List className="flex flex-col gap-1  overflow-y-auto">
              <Tag id={null} className={`font-medium justify-center ${selectedDate === null ? 'bg-yellow-400 text-black font-bold' : ''}`}>
                <Calendar size={12} className="mr-1" />
                All Dates
              </Tag>
              {getDaysInMonth().map((day) => (
                <Tag 
                  key={day.date} 
                  id={day.date}
                  className={`
                    justify-center text-sm py-1 h-5
                    ${selectedDate === day.date ? 'bg-yellow-400 text-black font-bold ' : ''}
                    ${day.hasData && selectedDate !== day.date ? (isDark ? 'bg-blue-500 hover:bg-blue-600 h-4' : 'bg-blue-300 hover:bg-blue-100 h-4') : ''}
                    ${!day.hasData && selectedDate !== day.date ? 'opacity-50' : ''}
                  `}
                >
                  {day.day}
                </Tag>
              ))}
            </TagGroup.List>
          </TagGroup>
          
          {selectedDate && (
            <div className={`mt-3 text-xs text-center ${isDark ? "text-blue-100" : "text-blue-800"}`}>
              {new Date(selectedDate).toLocaleDateString()}
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Right Side - Main Content */}
      <div className="flex-1 space-y-4">
        {/* Plant Sums Summary Table */}
       {/* Plant Sums Summary Table */}
<Card className="overflow-hidden shadow-none border-0">
  <Card.Content>
    <div className="mb-4">
      <h3 className="text-lg ">Plant Summary</h3>
      <p className="text-sm text-gray-500 mt-1">Overall totals across all locations</p>
    </div>
    
    <Table aria-label="Plant sums table">
      <Table.ScrollContainer className="max-h-[200px]">
        <Table.Content className="min-w-[800px]">
          <Table.Header>
            <Table.Column isRowHeader className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Location</Table.Column>
            <Table.Column align="end" className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Projected Shipped</Table.Column>
            <Table.Column align="end" className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Actual Shipped</Table.Column>
            <Table.Column align="end" className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Variance Amount</Table.Column>
            <Table.Column align="end" className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Efficiency</Table.Column>
          </Table.Header>

          <Table.Body renderEmptyState={() => <div className="text-center py-2 text-gray-500">No data available</div>}>
            <Table.Collection items={[
              {
                key: 'plant-sums',
                plant: 'Plant Sums',
                projected: totals.projected,
                actual: totals.actual,
                variance: totals.variance,
                percentage: totals.percentage
              }
            ]}>
              {(item) => (
                <Table.Row key={item.key} className="hover:bg-amber-50 transition-colors">
                  <Table.Cell className={` ${isDark ? "text-gray-100" : "text-gray-800"} px-3 py-1`}>
                    {item.plant}
                  </Table.Cell>
                  <Table.Cell align="end" className="font-semibold text-blue-600 px-3 py-1">
                    {formatCurrency(item.projected)}
                  </Table.Cell>
                  <Table.Cell align="end" className="font-semibold text-green-600 px-3 py-1">
                    {formatCurrency(item.actual)}
                  </Table.Cell>
                  <Table.Cell align="end" className={`font-semibold px-3 py-1 ${item.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(item.variance)}
                  </Table.Cell>
                  <Table.Cell align="end" className="px-3 py-1">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                      item.percentage >= 90 ? 'bg-green-100 text-green-700' :
                      item.percentage >= 70 ? 'bg-yellow-100 text-yellow-700' :
                      item.percentage >= 50 ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {formatPercentage(item.percentage)}
                    </span>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Collection>
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  </Card.Content>
</Card>

        {/* Plant Summary Table */}
       {/* Plant Summary Table */}
<Card className="overflow-hidden shadow-none border-0">
  <Card.Content>
    <div className="mb-4">
      <h3 className="text-lg font-semibold">Plant Performance Summary</h3>
      <p className="text-sm text-gray-500 mt-1">Detailed breakdown by location</p>
    </div>
    
    <Table aria-label="Plant summary table">
      <Table.ScrollContainer className="max-h-[400px]">
        <Table.Content className="min-w-[800px]">
          <Table.Header>
            <Table.Column isRowHeader className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Location</Table.Column>
            <Table.Column align="end" className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Projected Shipped</Table.Column>
            <Table.Column align="end" className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Actual Shipped</Table.Column>
            <Table.Column align="end" className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Variance Amount</Table.Column>
            <Table.Column align="end" className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Efficiency</Table.Column>
          </Table.Header>

          <Table.Body renderEmptyState={() => <div className="text-center py-8 text-gray-500">No data available</div>}>
            <Table.Collection items={plantSummary.map((item) => ({ ...item, key: item.plant }))}>
              {(item) => (
                <Table.Row key={item.key} className="hover:bg-amber-50 transition-colors">
                  <Table.Cell className={`font-medium ${isDark ? "text-gray-100" : "text-gray-800"} px-3 py-1`}>
                    {item.plant}
                  </Table.Cell>
                  <Table.Cell align="end" className="text-blue-600 font-medium px-3 py-1">
                    {formatCurrency(item.projected)}
                  </Table.Cell>
                  <Table.Cell align="end" className="text-green-600 font-medium px-3 py-1">
                    {formatCurrency(item.actual)}
                  </Table.Cell>
                  <Table.Cell align="end" className={`font-semibold px-3 py-1 ${item.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(item.variance)}
                  </Table.Cell>
                  <Table.Cell align="end" className="px-3 py-1">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                      item.projected === 0 ? 'bg-gray-100 text-gray-500' :
                      item.percentage >= 90 ? 'bg-green-100 text-green-700' :
                      item.percentage >= 70 ? 'bg-yellow-100 text-yellow-700' :
                      item.percentage >= 50 ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.projected === 0 ? '—' : formatPercentage(item.percentage)}
                    </span>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Collection>
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  </Card.Content>
</Card>
        <DescriptionSummary 
  shipments={shipments} 
  selectedDate={selectedDate} 
  isDark={isDark} 
/>
        {/* Detailed Shipments Table */}
        <Card className="overflow-hidden shadow-none border-0">
          <Card.Content>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Shipment Details</h3>
              {tableLoading && (
                <div className="flex items-center gap-2">
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
                  <Table.Content className="min-w-[1600px]">
                    <Table.Header>
                      <Table.Column isRowHeader>Plant</Table.Column>
                      <Table.Column>Status</Table.Column>
                      <Table.Column>Customer</Table.Column>
                      <Table.Column>Eng. #</Table.Column>
                      <Table.Column>SAP Part</Table.Column>
                      <Table.Column>Description</Table.Column>
                      <Table.Column align="end">Proj Qty</Table.Column>
                      <Table.Column align="end">Act Qty</Table.Column>
                      <Table.Column align="end">Price</Table.Column>
                      <Table.Column align="end">Proj ($)</Table.Column>
                      <Table.Column align="end">Act ($)</Table.Column>
                      <Table.Column>PO Number</Table.Column>
                      <Table.Column>Sales Order</Table.Column>
                      <Table.Column>Carrier</Table.Column>
                      <Table.Column>Pickup Time</Table.Column>
                      <Table.Column>Notes</Table.Column>
                    </Table.Header>

                    <Table.Body renderEmptyState={() => <div className="text-center py-8 text-gray-500">No shipments found</div>}>
                      <Table.Collection>
                      {(() => {
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

                // Build rows array with 10 rows per plant + total row
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
                        notes: shipment.notes
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
                      plant: `${plant} TOTAL`,
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
                              
                return allRows.map((row) => (
                  <Table.Row 
                    key={row.key} 
                    className={row.type === 'total' ? 'bg-gradient-to-r from-gray-100 to-gray-50 font-bold border-t-2 border-gray-300' : 
                                 row.type === 'empty' ? 'bg-gray-50 italic text-gray-400' : 
                                 'hover:bg-amber-50 transition-colors'}
                  >
                    <Table.Cell className={row.type === 'total' ? 'font-bold text-gray-800' : ''}>
                      {row.plant}
                    </Table.Cell>
                    <Table.Cell>
                      {row.type === 'shipment' && row.status ? (
                        <Chip
                          size="sm"
                          color={
                            row.status === "Shipped Full" ? "success" :
                            row.status === "Shipped Partial" ? "warning" :
                            row.status === "Shipped Over" ? "accent" :
                            "danger"
                          }
                          variant="flat"
                        >
                          {row.status}
                        </Chip>
                      ) : row.type === 'empty' ? '—' : ''}
                    </Table.Cell>
                    <Table.Cell>{row.type === 'shipment' ? (row.customer || "-") : (row.type === 'empty' ? '—' : '')}</Table.Cell>
                    <Table.Cell>{row.type === 'shipment' ? (row.engNumber || "-") : (row.type === 'empty' ? '—' : '')}</Table.Cell>
                    <Table.Cell>{row.type === 'shipment' ? (row.sapPart || "-") : (row.type === 'empty' ? '—' : '')}</Table.Cell>
                    <Table.Cell className="max-w-xs truncate" title={row.description}>
                      {row.type === 'shipment' ? (row.description?.substring(0, 50) || "-") : (row.type === 'empty' ? '—' : '')}
                    </Table.Cell>
                    <Table.Cell align="end">{row.type === 'shipment' ? row.projQty : (row.type === 'empty' ? '—' : '')}</Table.Cell>
                    <Table.Cell align="end">{row.type === 'shipment' ? row.actQty : (row.type === 'empty' ? '—' : '')}</Table.Cell>
                    <Table.Cell align="end">{row.type === 'shipment' && row.price ? formatCurrency(row.price) : (row.type === 'empty' ? '—' : '')}</Table.Cell>
                    <Table.Cell align="end" className={row.type === 'total' ? 'font-bold text-blue-700' : ''}>
                      {row.type === 'shipment' ? formatCurrency(row.projValue) : 
                       row.type === 'total' ? formatCurrency(row.projValue) : '—'}
                    </Table.Cell>
                    <Table.Cell align="end" className={row.type === 'total' ? 'font-bold text-green-700' : ''}>
                      {row.type === 'shipment' ? formatCurrency(row.actValue) : 
                       row.type === 'total' ? formatCurrency(row.actValue) : '—'}
                    </Table.Cell>
                    <Table.Cell>{row.type === 'shipment' ? (row.poNumber || "-") : (row.type === 'empty' ? '—' : '')}</Table.Cell>
                    <Table.Cell>{row.type === 'shipment' ? (row.salesOrder || "-") : (row.type === 'empty' ? '—' : '')}</Table.Cell>
                    <Table.Cell>{row.type === 'shipment' ? (row.carrier || "-") : (row.type === 'empty' ? '—' : '')}</Table.Cell>
                    <Table.Cell>
                      {row.type === 'shipment' && row.pickupTime ? new Date(row.pickupTime).toLocaleDateString() : (row.type === 'empty' ? '—' : '')}
                    </Table.Cell>
                    <Table.Cell className="max-w-xs truncate" title={row.notes}>
                      {row.type === 'shipment' ? (row.notes?.substring(0, 30) || "-") : (row.type === 'empty' ? '—' : '')}
                    </Table.Cell>
                  </Table.Row>
                ));
              })()}
                      </Table.Collection>
                    </Table.Body>
                  </Table.Content>
                </Table.ScrollContainer>
              </Table>
            )}
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}

export default Sheets;