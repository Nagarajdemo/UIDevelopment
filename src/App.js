import React, { useState } from 'react';
import * as XLSX from 'xlsx';

function App() {
  const [data, setData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const csvData = event.target.result;
      const workbook = XLSX.read(csvData, { type: 'string' });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      setData(parsedData);
    };

    reader.readAsText(file);
  };

  const handleReset = () => {
    setData([]);
  };

  // Utility to format currency
  const formatCurrency = (num) => {
    return '₹ ' + num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  // Utility to get color for PNL values
  const getColor = (val) => (val < 0 ? 'red' : 'green');

  // Only process if data exists and header is present
  const header = data[0] || [];
  const rows = data.slice(1);

  // Get indexes for columns by header names
  const idxOptionType = header.indexOf('OPTIONTYPE');
  const idxMargin = header.indexOf('MARGIN');
  const idxPNL = header.indexOf('PNL_BUYPRICE_CLOSEPRICE');

  // Calculate totals safely only if columns exist
  const totalTrades = rows.length;

  const totalInvestment = idxMargin >= 0
    ? rows.reduce((sum, row) => sum + (parseFloat(row[idxMargin]) || 0), 0)
    : 0;

  const pePNL = idxPNL >= 0 && idxOptionType >= 0
    ? rows.reduce(
        (sum, row) => (row[idxOptionType] === 'PE' ? sum + (parseFloat(row[idxPNL]) || 0) : sum),
        0
      )
    : 0;

  const cePNL = idxPNL >= 0 && idxOptionType >= 0
    ? rows.reduce(
        (sum, row) => (row[idxOptionType] === 'CE' ? sum + (parseFloat(row[idxPNL]) || 0) : sum),
        0
      )
    : 0;

  const overallPNL = idxPNL >= 0
    ? rows.reduce((sum, row) => sum + (parseFloat(row[idxPNL]) || 0), 0)
    : 0;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <h1 style={{ marginBottom: '10px', textAlign: 'center', color: '#2c3e50' }}>
        Real-Time Trading Data - Options
      </h1>

      {/* Upload / Home button */}
      <div style={{ marginBottom: '20px' }}>
        {data.length === 0 ? (
          <div style={{ textAlign: 'center' }}>
            <input type="file" accept=".csv" onChange={handleFileUpload} />
          </div>
        ) : (
          <button
            onClick={handleReset}
            style={{
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              fontSize: '24px',
              color: '#2c3e50',
              marginBottom: '10px',
            }}
            title="Go back to Browse screen"
            aria-label="Go Home"
          >
            🏠 Home
          </button>
        )}
      </div>

      {/* Summary Box */}
      {data.length > 1 && (
        <div
          style={{
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            marginBottom: '30px',
            width: '100%',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {/* Left Side */}
          <div style={{ minWidth: '300px' }}>
            <div
              style={{
                fontWeight: 'bold',
                fontSize: '16px',
                marginBottom: '10px',
                textAlign: 'left',
              }}
            >
              Total number of trades: {totalTrades}
            </div>
            <div
              style={{
                fontWeight: 'bold',
                fontSize: '16px',
                marginBottom: '10px',
                textAlign: 'left',
              }}
            >
              Total Investment: {formatCurrency(totalInvestment)}
            </div>
          </div>

          {/* Center Section (PE, CE, Overall PNL) */}
          <div
            style={{
              textAlign: 'center',
              flex: 1,
              minWidth: '300px',
            }}
          >
            <div
              style={{
                fontWeight: 'bold',
                fontSize: '16px',
                marginBottom: '10px',
                color: getColor(pePNL),
              }}
            >
              PNL_FOR_ALL_PE Options: {formatCurrency(pePNL)}
            </div>
            <div
              style={{
                fontWeight: 'bold',
                fontSize: '16px',
                marginBottom: '10px',
                color: getColor(cePNL),
              }}
            >
              PNL_FOR_ALL_CE Options: {formatCurrency(cePNL)}
            </div>
            <div
              style={{
                fontWeight: 'bold',
                fontSize: '18px',
                color: getColor(overallPNL),
              }}
            >
              Overall PNL: {formatCurrency(overallPNL)}
            </div>
          </div>
        </div>
      )}

      {/* Render table */}
      {data.length > 0 && (
        <table
          border="1"
          cellPadding="8"
          style={{ borderCollapse: 'collapse', width: '100%' }}
        >
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={i === 0 ? { fontWeight: 'bold', backgroundColor: '#eaeaea' } : {}}>
                {row.map((cell, j) => {
                  // Highlight PNL_BUYPRICE_CLOSEPRICE column values by color
                  if (i > 0 && j === idxPNL) {
                    const val = parseFloat(cell);
                    return (
                      <td key={j} style={{ color: val < 0 ? 'red' : 'green' }}>
                        {cell}
                      </td>
                    );
                  }
                  return <td key={j}>{cell}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
