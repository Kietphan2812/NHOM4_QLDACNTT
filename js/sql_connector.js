/* ==========================================================================
   GRAB RIDE PLATFORM - DIRECT REAL-TIME SQL SERVER CONNECTOR
   API_BASE_URL = 'http://localhost:5000/api'
   Matches exact pattern from project QLDACNTT (Try-Catch / Fallback / Live Sync)
   ========================================================================== */

const API_BASE_URL = 'http://localhost:5000/api';

window.SqlConnector = {
  // Sync live table records directly from SQL Server database QLGRAB
  async getTableData(tableName) {
    try {
      const res = await fetch(`${API_BASE_URL}/${tableName}`);
      if (res.ok) {
        const resData = await res.json();
        const data = Array.isArray(resData) ? resData : (resData ? [resData] : []);
        console.log(`[SQL Server QLGRAB] Synced ${data.length} records for dbo.${tableName}`);
        return data;
      }
    } catch (err) {
      console.warn(`SQL Sync warning for ${tableName}:`, err);
    }
    return null;
  },

  // Insert new record directly into SQL Server QLGRAB
  async insertRecord(tableName, fieldsObj) {
    try {
      const res = await fetch(`${API_BASE_URL}/${tableName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fieldsObj)
      });
      if (res.ok) {
        const result = await res.json();
        return result.success;
      }
    } catch (err) {
      console.warn(`SQL Save warning for ${tableName}:`, err);
    }
    return false;
  },

  // Update record directly in SQL Server QLGRAB
  async updateRecord(tableName, pkCol, pkVal, fieldsObj) {
    try {
      const res = await fetch(`${API_BASE_URL}/${tableName}?pkCol=${pkCol}&pkVal=${pkVal}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fieldsObj)
      });
      if (res.ok) {
        const result = await res.json();
        return result.success;
      }
    } catch (err) {
      console.warn(`SQL Update warning for ${tableName}:`, err);
    }
    return false;
  },

  // Delete record directly from SQL Server QLGRAB
  async deleteRecord(tableName, pkCol, pkVal) {
    try {
      const res = await fetch(`${API_BASE_URL}/${tableName}?pkCol=${pkCol}&pkVal=${pkVal}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const result = await res.json();
        return result.success;
      }
    } catch (err) {
      console.warn(`SQL Delete warning for ${tableName}:`, err);
    }
    return false;
  }
};
