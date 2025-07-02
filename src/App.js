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

  const calculateSums = () => {
    const headers = data[0];
    const rows = data.slice(1);

    const marginIndex = headers.indexOf("MARGIN");
    const pnlIndex = headers.indexOf("PNL_BUYPRICE_CLOSEPRICE");
    const optionTypeIndex = headers.indexOf("OPTION TYPE");

    let totalInvestment = 0;
    let pnlPE = 0;
    let pnlCE = 0;
    let totalPNL = 0;

    rows.forEach((row) => {
      const margin = parseFloat(row[marginIndex]) || 0;
      const pnl = parseFloat(row[pnlIndex]) || 0;
      const optionType = row[optionTypeIndex] || "";

      totalInvestment += margin;
      totalPNL += pnl;

      if (optionType === "PE") {
        pnlPE += pnl;
      } else if (optionType === "CE") {
        pnlCE += pnl;
      }
    });

    return {
      totalInvestment,
      pnlPE,
      pnlCE,
      totalPNL,
    };
  };

  const { totalInvestment, pnlPE, pnlCE, totalPNL } = data.length > 1 ? calculateSums() : {
    totalInvestment: 0,
    pnlPE: 0,
    pnlCE: 0,
    totalPNL: 0,
  };

  const getPNLStyle = (value) => ({
    color: value < 0 ? 'red' : 'green',
    fontWeight: 'bold',
  });

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

      {/* Summary Section */}
      {data.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
            Total number of trades: {data.length - 1}
            <br />
            Total Investment: ₹ {totalInvestment.toFixed(2)}
            <br />
            Overall PNL: <span style={getPNLStyle(totalPNL)}>₹ {totalPNL.toFixed(2)}</span>
          </div>

          <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>
            <div>
              PNL_FOR_ALL_PE Options: <span style={getPNLStyle(pnlPE)}>₹ {pnlPE.toFixed(2)}</span>
            </div>
            <div>
              PNL_FOR_ALL_CE Options: <span style={getPNLStyle(pnlCE)}>₹ {pnlCE.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Table Rendering */}
      {data.length > 0 && (
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{cell}</td>
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
