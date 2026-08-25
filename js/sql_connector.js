/* ==========================================================================
   GRAB RIDE PLATFORM - DIRECT REAL-TIME SQL SERVER CONNECTOR
   Connects Web Frontend directly to PowerShell Server (http://localhost:3000)
   and handles SELECT, INSERT, UPDATE, and DELETE directly on SQL Server QLGRAB!
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
      console.warn('[SQL Connector] Server PowerShell http://localhost:3000 not responding.', err);
    }
    return null;
  },

  // Insert new record directly into SQL Server QLGRAB
  async insertRecord(tableName, fieldsObj) {
    try {
      const res = await fetch(API_SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: tableName,
          fields: fieldsObj,
          isUpdate: false
        })
      });
      if (res.ok) {
        const result = await res.json();
        return result.success;
      }
    } catch (err) {
      console.warn('[SQL Connector] Could not connect to PowerShell Server', err);
    }
    return false;
  },

  // Update record directly in SQL Server QLGRAB
  async updateRecord(tableName, pkCol, pkVal, fieldsObj) {
    try {
      const res = await fetch(API_SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: tableName,
          fields: fieldsObj,
          isUpdate: true,
          pkCol: pkCol,
          pkVal: pkVal
        })
      });
      if (res.ok) {
        const result = await res.json();
        return result.success;
      }
    } catch (err) {
      console.warn('[SQL Connector] Could not connect to PowerShell Server', err);
    }
    return false;
  },

  // Delete record directly from SQL Server QLGRAB
  async deleteRecord(tableName, pkCol, pkVal) {
    try {
      const res = await fetch(`${API_SERVER_URL}?table=${tableName}&pkCol=${pkCol}&pkVal=${pkVal}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const result = await res.json();
        return result.success;
      }
    } catch (err) {
      console.warn('[SQL Connector] Could not connect to PowerShell Server', err);
    }
    return false;
  }
};
