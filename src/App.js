import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

function App() {
  const [data, setData] = useState([]);
  const [lastContent, setLastContent] = useState('');

  const fetchAndParseFile = async () => {
    try {
      const response = await fetch('/sample.csv');
      const text = await response.text();

      if (text !== lastContent) {
        setLastContent(text);
        const workbook = XLSX.read(text, { type: 'string' });
        const sheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheet];
        const parsed = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        setData(parsed);
      }
    } catch (err) {
      console.error('Error loading file:', err);
    }
  };

  useEffect(() => {
    fetchAndParseFile(); // Initial load
    const interval = setInterval(fetchAndParseFile, 10000); // every 30 seconds
    return () => clearInterval(interval); // cleanup
  }, [lastContent]);

  const formatCurrency = (num) => '₹ ' + num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  const getColor = (val) => (val < 0 ? 'red' : 'green');

  const header = data[0] || [];
  const rows = data.slice(1);
  const idxOptionType = header.indexOf('OPTIONTYPE');
  const idxMargin = header.indexOf('MARGIN');
  const idxPNL = header.indexOf('PNL_BUYPRICE_CLOSEPRICE');

  const totalTrades = rows.length;
  const totalInvestment = idxMargin >= 0
    ? rows.reduce((sum, row) => sum + (parseFloat(row[idxMargin]) || 0), 0)
    : 0;

  const pePNL = idxPNL >= 0 && idxOptionType >= 0
    ? rows.reduce((sum, row) => row[idxOptionType] === 'PE' ? sum + (parseFloat(row[idxPNL]) || 0) : sum, 0)
    : 0;

  const cePNL = idxPNL >= 0 && idxOptionType >= 0
    ? rows.reduce((sum, row) => row[idxOptionType] === 'CE' ? sum + (parseFloat(row[idxPNL]) || 0) : sum, 0)
    : 0;

  const overallPNL = idxPNL >= 0
    ? rows.reduce((sum, row) => sum + (parseFloat(row[idxPNL]) || 0), 0)
    : 0;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50' }}>
        Auto-Updated Trading Data
      </h1>

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
          <div style={{ minWidth: '300px', textAlign: 'left' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
              Total number of trades: {totalTrades}
            </div>
            <div style={{ fontWeight: 'bold' }}>
              Total Investment: {formatCurrency(totalInvestment)}
            </div>
          </div>

          <div style={{ flex: 1, textAlign: 'center', minWidth: '300px' }}>
            <div style={{ fontWeight: 'bold', color: getColor(pePNL) }}>
              PNL_FOR_ALL_PE Options: {formatCurrency(pePNL)}
            </div>
            <div style={{ fontWeight: 'bold', color: getColor(cePNL) }}>
              PNL_FOR_ALL_CE Options: {formatCurrency(cePNL)}
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '18px', color: getColor(overallPNL) }}>
              Overall PNL: {formatCurrency(overallPNL)}
            </div>
          </div>
        </div>
      )}

      {data.length > 0 && (
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={i === 0 ? { fontWeight: 'bold', backgroundColor: '#eaeaea' } : {}}>
                {row.map((cell, j) => {
                  if (i > 0 && j === idxPNL) {
                    const val = parseFloat(cell);
                    return (
                      <td key={j} style={{ color: val < 0 ? 'red' : 'green' }}>{cell}</td>
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
