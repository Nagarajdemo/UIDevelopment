import React, { useState } from 'react';
import * as XLSX from 'xlsx';

function App() {
  const [data, setData] = useState([]);

  // Handle file upload and parse CSV
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

  // Reset app to initial state
  const handleReset = () => {
    setData([]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <h1 style={{ marginBottom: '10px', textAlign: 'center', color: '#2c3e50' }}>
        Real-Time Trading Data - Options
      </h1>

      {/* Conditional rendering for Upload or Home icon */}
      <div style={{ marginBottom: '20px' }}>
        {data.length === 0 ? (
          // Show file input if no data uploaded
          <div style={{ textAlign: 'center' }}>
            <input type="file" accept=".csv" onChange={handleFileUpload} />
          </div>
        ) : (
          // Show Home icon button aligned left after upload
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

      {/* Total trades count aligned left */}
      {data.length > 1 && (
        <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '10px', textAlign: 'left' }}>
          Total number of trades: {data.length - 1}
        </div>
      )}

      {/* Render table */}
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
