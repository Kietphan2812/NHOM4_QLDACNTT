/* ==========================================================================
   GRAB RIDE PLATFORM - DIRECT REAL-TIME SQL SERVER CONNECTOR
   Connects Web Frontend directly to PowerShell Server (http://localhost:3000)
   and saves every single record straight into SQL Server database QLGRAB!
   ========================================================================== */

const API_SERVER_URL = 'http://localhost:3000/api/data';

window.SqlConnector = {
  // Fetch live table records directly from SQL Server QLGRAB
  async getTableData(tableName) {
    try {
      const res = await fetch(`${API_SERVER_URL}?table=${tableName}`);
      if (res.ok) {
        const data = await res.json();
        console.log(`[SQL Server QLGRAB] Loaded ${data.length} records for dbo.${tableName}`);
        return data;
      }
    } catch (err) {
      console.warn('[SQL Connector] Server PowerShell localhost:3000 not responding, using local fallback state.', err);
    }
    return null;
  },

  // Save new record directly into SQL Server QLGRAB in real-time
  async insertRecord(tableName, fieldsObj) {
    try {
      const res = await fetch(API_SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: tableName,
          fields: fieldsObj
        })
      });
      if (res.ok) {
        const result = await res.json();
        console.log(`[SQL Server QLGRAB] Inserted record into dbo.${tableName}:`, result);
        return result.success;
      }
    } catch (err) {
      console.warn('[SQL Connector] Could not connect to PowerShell WebServer at http://localhost:3000', err);
    }
    return false;
  }
};
