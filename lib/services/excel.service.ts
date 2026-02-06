import ExcelJS from 'exceljs';
import { ProcessedReceipt, ExportField, ExportFieldKey, DEFAULT_EXPORT_FIELDS } from '../types';

/**
 * Column configuration for Excel export
 */
const COLUMN_CONFIG: Record<ExportFieldKey, { header: string; key: string; width: number }> = {
  date: { header: 'Date', key: 'date', width: 15 },
  vendor: { header: 'Vendor', key: 'vendor', width: 30 },
  category: { header: 'Category', key: 'category', width: 15 },
  description: { header: 'Description', key: 'description', width: 40 },
  amount: { header: 'Amount', key: 'amount', width: 12 },
  orderId: { header: 'Order ID', key: 'orderId', width: 20 },
  paymentMethod: { header: 'Payment Method', key: 'paymentMethod', width: 18 },
  fileName: { header: 'File Name', key: 'fileName', width: 30 },
};

/**
 * Excel Service
 * Generates Excel files from processed receipt data
 */
export class ExcelService {
  /**
   * Generate Excel buffer from receipts with selected fields
   */
  async generateExcel(
    receipts: ProcessedReceipt[], 
    selectedFields?: ExportField[]
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Receipts');

    // Use selected fields or default to all enabled fields
    const fields = selectedFields || DEFAULT_EXPORT_FIELDS;
    const enabledFields = fields.filter(f => f.enabled);

    // Define columns based on selected fields
    worksheet.columns = enabledFields.map(field => COLUMN_CONFIG[field.key]);

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF8B5CF6' }, // Purple header
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data rows
    receipts.forEach((receipt) => {
      const rowData: Record<string, any> = {};
      
      enabledFields.forEach(field => {
        switch (field.key) {
          case 'date':
            rowData.date = receipt.transactionDate || 'N/A';
            break;
          case 'vendor':
            rowData.vendor = receipt.vendor || 'Unknown';
            break;
          case 'category':
            rowData.category = receipt.category;
            break;
          case 'description':
            rowData.description = receipt.description || '';
            break;
          case 'amount':
            rowData.amount = receipt.amount || 0;
            break;
          case 'orderId':
            rowData.orderId = receipt.orderId || 'N/A';
            break;
          case 'paymentMethod':
            rowData.paymentMethod = receipt.paymentMethod || 'N/A';
            break;
          case 'fileName':
            rowData.fileName = receipt.fileName || '';
            break;
        }
      });

      worksheet.addRow(rowData);
    });

    // Format amount column as currency if included
    const amountField = enabledFields.find(f => f.key === 'amount');
    if (amountField) {
      const amountColIndex = enabledFields.indexOf(amountField) + 1;
      worksheet.getColumn(amountColIndex).numFmt = '₹#,##0.00';
    }

    // Add totals row if amount is included
    if (amountField) {
      const amountColIndex = enabledFields.indexOf(amountField) + 1;
      const amountColLetter = String.fromCharCode(64 + amountColIndex);
      
      const totalRowData: Record<string, any> = {};
      enabledFields.forEach((field, idx) => {
        if (field.key === 'amount') {
          totalRowData.amount = {
            formula: `SUM(${amountColLetter}2:${amountColLetter}${receipts.length + 1})`,
          };
        } else if (idx === 0) {
          totalRowData[field.key] = 'TOTAL';
        } else {
          totalRowData[field.key] = '';
        }
      });

      const totalRow = worksheet.addRow(totalRowData);
      totalRow.font = { bold: true };
      totalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFD700' }, // Gold total row
      };
    }

    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
