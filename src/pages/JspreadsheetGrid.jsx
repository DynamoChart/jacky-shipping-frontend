import React, { useEffect, useRef } from 'react';
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import 'jsuites/dist/jsuites.css';

const JspreadsheetGrid = ({ data, formatCurrency, formatPercentage }) => {
  const gridRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!gridRef.current || instanceRef.current) return;

    // Prepare formatted data for display
    const displayData = data.map(row => [
      row[0], // Plant name
      formatCurrency(row[1]), // Projected
      formatCurrency(row[2]), // Actual
      formatCurrency(row[3]), // Variance
      row[4] === 0 ? '—' : `${row[4].toFixed(1)}%` // Percentage
    ]);

    try {
      // Create spreadsheet instance with correct v5 syntax
      instanceRef.current = jspreadsheet(gridRef.current, {
        worksheets: [{
          data: displayData,
          columns: [
            { type: 'text', title: 'Location', width: '120px', readOnly: true },
            { type: 'text', title: 'Projected Shipped', width: '160px', align: 'right', readOnly: true },
            { type: 'text', title: 'Actual Shipped', width: '160px', align: 'right', readOnly: true },
            { type: 'text', title: 'Variance Amount', width: '160px', align: 'right', readOnly: true },
            { type: 'text', title: 'Efficiency', width: '140px', align: 'right', readOnly: true }
          ],
          minDimensions: [5, Math.max(data.length, 5)],
          allowInsertColumn: false,
          allowDeleteColumn: false,
          allowInsertRow: false,
          allowDeleteRow: false,
          allowRenameColumn: false,
          columnSorting: true,
          tableOverflow: true,
          tableWidth: '100%',
        }]
      });

      // Apply conditional formatting after a small delay to ensure DOM is ready
      setTimeout(() => {
        const worksheet = instanceRef.current[0];
        
        for (let i = 0; i < data.length; i++) {
          const percentage = data[i][4];
          const variance = data[i][3];
          
          // Format percentage column (index 4)
          try {
            const cell = worksheet.getCell(i, 4);
            if (cell) {
              if (percentage === 0) {
                cell.style.backgroundColor = '#f3f4f6';
                cell.style.color = '#9ca3af';
              } else if (percentage >= 90) {
                cell.style.backgroundColor = '#dcfce7';
                cell.style.color = '#166534';
                cell.style.fontWeight = 'bold';
              } else if (percentage >= 70) {
                cell.style.backgroundColor = '#fef9c3';
                cell.style.color = '#854d0e';
                cell.style.fontWeight = 'bold';
              } else if (percentage >= 50) {
                cell.style.backgroundColor = '#ffedd5';
                cell.style.color = '#9a3412';
              } else {
                cell.style.backgroundColor = '#fee2e2';
                cell.style.color = '#991b1b';
                cell.style.fontWeight = 'bold';
              }
            }
            
            // Format variance column (index 3)
            const varianceCell = worksheet.getCell(i, 3);
            if (varianceCell) {
              if (variance > 0) {
                varianceCell.style.color = '#16a34a';
                varianceCell.style.fontWeight = 'bold';
              } else if (variance < 0) {
                varianceCell.style.color = '#dc2626';
                varianceCell.style.fontWeight = 'bold';
              }
            }
          } catch (err) {
            console.warn('Error styling cell:', err);
          }
        }
      }, 100);
      
    } catch (error) {
      console.error('Error creating spreadsheet:', error);
    }
    
    return () => {
      if (instanceRef.current && gridRef.current) {
        try {
          jspreadsheet.destroy(gridRef.current);
        } catch (error) {
          console.warn('Error destroying spreadsheet:', error);
        }
        instanceRef.current = null;
      }
    };
  }, [data, formatCurrency, formatPercentage]);

  return <div ref={gridRef} className="jspreadsheet-container" style={{ width: '100%' }} />;
};

export default JspreadsheetGrid;