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

  const getColumnIndex = (headerName) => {
    return data.length > 0 ? data[0].indexOf(headerName) : -1;
  };

  const calculateSummary = () => {
    const marginIndex = getColumnIndex('MARGIN');
    const pnlIndex = getColumnIndex('PNL_BUYPRICE_CLOSEPRICE');
    const optionTypeIndex = getColumnIndex('OPTION TYPE');

    if (marginIndex === -1 || pnlIndex === -1 || optionTypeIndex === -1) {
      return {
        totalInvestment: 0,
        pnlPE: 0,
        pnlCE: 0,
        overallPNL: 0,
      };
    }

    let totalInvestment = 0;
    let pnlPE = 0;
    let pnlCE = 0;
    let overallPNL = 0;

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const margin = parseFloat(row[marginIndex]) || 0;
      const pnl = parseFloat(row[pnlIndex]) || 0;
      const type = row[optionTypeIndex]?.toUpperCase();

      totalInvestment += margin;
      overallPNL += pnl;

      if (type === 'PE') {
        pnlPE += pnl;
      } else if (type === 'CE') {
        pnlCE += pnl;
      }
    }

    return {
      totalInvestment,
      pnlPE,
      pnlCE,
      overallPNL,
    };
  };

  const { totalInvestment, pnlPE, pnlCE, overallPNL } = calculateSummary();

  const formatCurrency = (value) =>
    `₹ ${value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const getColor = (value) => (value >= 0 ? 'green' : 'red');

  const pnlIndex = getColumnIndex('PNL_BUYPRICE_CLOSEPRICE');

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: '10px', textAlign: 'center', color: '#2c3e50' }}>
        Real-Time Trading Data - Options
      </h1>

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

      {data.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
              Total number of trades: {data.length - 1}
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
              Total Investment: {formatCurrency(totalInvestment)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontWeight: 'bold',
                fontSize: '16px',
                color: getColor(pnlPE),
              }}
            >
              PNL_FOR_ALL_PE Options: {formatCurrency(pnlPE)}
            </div>
            <div
              style={{
                fontWeight: 'bold',
                fontSize: '16px',
                color: getColor(pnlCE),
              }}
            >
              PNL_FOR_ALL_CE Options: {formatCurrency(pnlCE)}
            </div>
            <div
              style={{
                fontWeight: 'bold',
                fontSize: '16px',
                color: getColor(overallPNL),
                marginTop: '8px',
              }}
            >
              Overall PNL: {formatCurrency(overallPNL)}
            </div>
          </div>
        </div>
      )}

      {data.length > 0 && (
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    style={
                      j === pnlIndex && i > 0
                        ? { color: getColor(parseFloat(cell) || 0), fontWeight: 'bold' }
                        : {}
                    }
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
