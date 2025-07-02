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

  const calculateValues = () => {
    if (data.length < 2) return { totalInvestment: 0, totalPE: 0, totalCE: 0 };

    const header = data[0].map((h) => h?.toString().trim().toUpperCase());

    const optionTypeIndex = header.indexOf('OPTION TYPE');
    const pnlIndex = header.indexOf('PNL_BUYPRICE_CLOSEPRICE');
    const marginIndex = header.indexOf('MARGIN');

    let totalInvestment = 0;
    let totalPE = 0;
    let totalCE = 0;

    data.slice(1).forEach((row) => {
      const optionType = row[optionTypeIndex]?.toString().trim().toUpperCase();
      const pnl = parseFloat(row[pnlIndex]?.toString().replace(/[^0-9.-]/g, '')) || 0;
      const margin = parseFloat(row[marginIndex]?.toString().replace(/[^0-9.-]/g, '')) || 0;

      totalInvestment += margin;

      if (optionType === 'PE') totalPE += pnl;
      else if (optionType === 'CE') totalCE += pnl;
    });

    return { totalInvestment, totalPE, totalCE };
  };

  const { totalInvestment, totalPE, totalCE } = calculateValues();

  const getPNLStyle = (value) => ({
    fontWeight: 'bold',
    fontSize: '16px',
    marginTop: '5px',
    color: value >= 0 ? 'green' : 'red',
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

      {data.length > 1 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
            Total number of trades: {data.length - 1}
          </div>
          <div style={{ fontWeight: 'bold', fontSize: '16px', marginTop: '5px' }}>
            Total Investment: ₹ {totalInvestment.toFixed(2)}
          </div>
          <div style={getPNLStyle(totalPE)}>
            PNL_FOR_ALL_PE Options: ₹ {totalPE.toFixed(2)}
          </div>
          <div style={getPNLStyle(totalCE)}>
            PNL_FOR_ALL_CE Options: ₹ {totalCE.toFixed(2)}
          </div>
        </div>
      )}

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

