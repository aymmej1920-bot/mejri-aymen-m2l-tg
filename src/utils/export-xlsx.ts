import * as XLSX from 'xlsx';

export const exportToXlsx = <T extends Record<string, any>>(
  filename: string,
  data: T[],
  sheetName: string = "Feuille1",
  headers?: { key: keyof T; label: string }[]
) => {
  if (!data || data.length === 0) {
    console.warn("No data to export.");
    return;
  }

  const wsData = [];

  // Prepare headers
  const actualHeaders = headers || Object.keys(data[0]).map(key => ({ key, label: String(key) }));
  wsData.push(actualHeaders.map(h => h.label));

  // Prepare data rows
  for (const row of data) {
    const values = actualHeaders.map(h => {
      const value = row[h.key];
      // Handle null/undefined, arrays, and stringify for XLSX
      if (value === null || value === undefined) {
        return '';
      }
      if (Array.isArray(value) || typeof value === 'object') {
        return JSON.stringify(value);
      }
      return String(value);
    });
    wsData.push(values);
  }

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
};