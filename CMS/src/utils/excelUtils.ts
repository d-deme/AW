// utils/excelUtils.ts
import ExcelJS from 'exceljs';

/**
 * Import Excel file binary data and convert to JSON array.
 * Supports .xlsx and .xls formats.
 */
export async function importExcelFile(binaryData: string | ArrayBuffer): Promise<any[]> {
  const workbook = new ExcelJS.Workbook();
  // ExcelJS can read from a Buffer; ensure we have Uint8Array
  const buffer = typeof binaryData === 'string' ? Buffer.from(binaryData, 'binary') : Buffer.from(binaryData);
  await (workbook.xlsx as any).load(buffer);
  const worksheet = workbook.worksheets[0];
  const rows: any[] = [];
  const headerRow = worksheet.getRow(1);
  const headers = headerRow.values as (string | null)[];
  // ExcelJS row values start at index 1
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    const obj: any = {};
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers[colNumber] as string | undefined;
      if (header) obj[header] = cell.value ?? '';
    });
    rows.push(obj);
  });
  return rows;
}

/**
 * Export JSON data to an Excel file.
 * @param data Array of objects to write.
 * @param filename Desired filename (including .xlsx extension).
 */
export async function exportDataToExcel(data: any[], filename: string): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Export');
  if (data.length === 0) {
    // create empty sheet with no rows
    await workbook.xlsx.writeFile(filename);
    return;
  }
  // Add header row based on keys of first object
  const headers = Object.keys(data[0]);
  worksheet.columns = headers.map((h) => ({ header: h, key: h }));
  // Add rows
  data.forEach((item) => worksheet.addRow(item));
  await workbook.xlsx.writeFile(filename);
}
