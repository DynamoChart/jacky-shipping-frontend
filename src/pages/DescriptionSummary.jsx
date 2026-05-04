import React, { useMemo } from "react";
import { Card, Table, Chip, Spinner } from "@heroui/react";

function DescriptionSummary({ shipments, selectedDate, isDark }) {
  // Filter shipments by selected date
  const filteredShipments = useMemo(() => {
    if (!selectedDate) return shipments;
    return shipments.filter(s => {
      if (!s.pickupTime) return false;
      const shipmentDate = new Date(s.pickupTime).toISOString().split('T')[0];
      return shipmentDate === selectedDate;
    });
  }, [shipments, selectedDate]);

  // Group by description
  const descriptionSummary = useMemo(() => {
    const summaryMap = new Map();
    
    filteredShipments.forEach(s => {
      const description = s.description || "No Description";
      
      if (!summaryMap.has(description)) {
        summaryMap.set(description, {
          description: description,
          engNumbers: new Set(),
          totalProjQty: 0,
          totalActQty: 0,
          totalProjValue: 0,
          totalActValue: 0
        });
      }
      
      const current = summaryMap.get(description);
      
      // Add unique Eng # (engNumber)
      if (s.engNumber) {
        current.engNumbers.add(s.engNumber);
      }
      
      // Add quantities
      current.totalProjQty += s.projectedQty || 0;
      current.totalActQty += s.actualQty || 0;
      
      // Add values
      current.totalProjValue += (s.projectedQty || 0) * (s.price || 0);
      current.totalActValue += (s.actualQty || 0) * (s.price || 0);
    });
    
    // Convert to array and calculate additional fields
    return Array.from(summaryMap.values())
      .map(item => ({
        description: item.description,
        engCount: item.engNumbers.size,
        engNumbersList: Array.from(item.engNumbers).join(", "),
        totalProjQty: item.totalProjQty,
        totalActQty: item.totalActQty,
        totalProjValue: item.totalProjValue,
        totalActValue: item.totalActValue,
        variance: item.totalActValue - item.totalProjValue,
        efficiency: item.totalProjValue > 0 
          ? (item.totalActValue / item.totalProjValue) * 100 
          : 0
      }))
      .sort((a, b) => b.totalProjValue - a.totalProjValue); // Sort by highest projected value first
  }, [filteredShipments]);

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

  if (descriptionSummary.length === 0) {
    return (
      <Card className="overflow-hidden shadow-none border-0">
        <Card.Content>
          <div className="text-center py-8 text-gray-500">
            No description data available
          </div>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-none border-0">
      <Card.Content>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Description Summary</h3>
          <p className="text-sm text-gray-500 mt-1">Grouped by description with unique Eng # count</p>
        </div>
        
        <Table aria-label="Description summary table">
          <Table.ScrollContainer className="max-h-[400px]">
            <Table.Content className="min-w-[1000px]">
              <Table.Header>
                <Table.Column isRowHeader className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Description</Table.Column>
                <Table.Column align="center" className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Distinct Eng #</Table.Column>
                <Table.Column align="end" className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Total Proj Qty</Table.Column>
                <Table.Column align="end" className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Total Act Qty</Table.Column>
                <Table.Column align="end" className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Total Proj ($)</Table.Column>
                <Table.Column align="end" className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Total Act ($)</Table.Column>
                <Table.Column align="end" className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Variance</Table.Column>
                <Table.Column align="end" className="bg-gray-100 font-bold text-gray-700 px-3 py-1">Efficiency</Table.Column>
              </Table.Header>

              <Table.Body renderEmptyState={() => <div className="text-center py-2">No data available</div>}>
                <Table.Collection items={descriptionSummary.map((item, idx) => ({ ...item, key: item.description + idx }))}>
                  {(item) => (
                    <Table.Row key={item.key} className="hover:bg-amber-50 transition-colors">
                      <Table.Cell className={`font-medium ${isDark ? "text-gray-100" : "text-gray-800"} px-3 py-1 max-w-md truncate`} title={item.description}>
                        {item.description}
                      </Table.Cell>
                      <Table.Cell align="center" className="px-3 py-1">
                        <Chip size="sm" variant="flat" color="primary">
                          {item.engCount}
                        </Chip>
                      </Table.Cell>
                      <Table.Cell align="end" className="px-3 py-1">{item.totalProjQty}</Table.Cell>
                      <Table.Cell align="end" className="px-3 py-1">{item.totalActQty}</Table.Cell>
                      <Table.Cell align="end" className="text-blue-600 font-medium px-3 py-1">
                        {formatCurrency(item.totalProjValue)}
                      </Table.Cell>
                      <Table.Cell align="end" className="text-green-600 font-medium px-3 py-1">
                        {formatCurrency(item.totalActValue)}
                      </Table.Cell>
                      <Table.Cell align="end" className={`font-semibold px-3 py-1 ${item.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(item.variance)}
                      </Table.Cell>
                      <Table.Cell align="end" className="px-3 py-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                          item.efficiency >= 90 ? 'bg-green-100 text-green-700' :
                          item.efficiency >= 70 ? 'bg-yellow-100 text-yellow-700' :
                          item.efficiency >= 50 ? 'bg-orange-100 text-orange-700' :
                          item.efficiency > 0 ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {item.efficiency > 0 ? formatPercentage(item.efficiency) : '—'}
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
  );
}

export default DescriptionSummary;