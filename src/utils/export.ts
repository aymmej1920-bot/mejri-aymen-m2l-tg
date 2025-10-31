export const exportToCsv = <T extends Record<string, any>>(
  filename: string,
  data: T[],
  headers?: { key: keyof T; label: string }[]
) => {
  if (!data || data.length === 0) {
    console.warn("No data to export.");
    return;
  }

  const actualHeaders = headers || Object.keys(data[0]).map(key => ({ key, label: key }));

  const csvRows = [];
  // Add header row
  csvRows.push(actualHeaders.map(h => `"${h.label}"`).join(','));

  // Add data rows
  for (const row of data) {
    const values = actualHeaders.map(h => {
      const value = row[h.key];
      // Handle null/undefined, arrays, and stringify for CSV
      if (value === null || value === undefined) {
        return '""';
      }
      if (Array.isArray(value)) {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`; // Escape double quotes within JSON string
      }
      return `"${String(value).replace(/"/g, '""')}"`; // Escape double quotes
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) { // Feature detection for download attribute
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};