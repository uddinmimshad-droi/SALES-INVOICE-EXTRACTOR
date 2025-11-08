
export const jsonToCsv = <T extends object>(jsonData: T[]): string => {
  if (!jsonData || jsonData.length === 0) {
    return '';
  }

  const keys = Object.keys(jsonData[0]) as (keyof T)[];
  const header = keys.join(',') + '\n';
  
  const rows = jsonData.map(row => {
    return keys.map(key => {
      let cellData = row[key];
      // Handle null or undefined
      if (cellData === null || cellData === undefined) {
          cellData = '' as T[keyof T];
      }
      
      let cell = String(cellData);
      
      // Escape commas and quotes
      if (cell.includes(',')) {
        cell = `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',');
  }).join('\n');
  
  return header + rows;
};

export const downloadCsv = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
