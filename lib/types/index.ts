// Core data types for receipt processing

export interface ProcessedReceipt {
  id: string;
  fileName: string;
  transactionDate: string;
  vendor: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  orderId?: string;
  paymentMethod?: string;
  rawText?: string;
  error?: string;
}

export type ExpenseCategory = 
  | 'Food' 
  | 'Travel' 
  | 'Shopping' 
  | 'Utilities' 
  | 'Other';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
}

export interface ProcessingResult {
  success: boolean;
  receipts: ProcessedReceipt[];
  errors: string[];
  totalProcessed: number;
}

export interface ExtractionResult {
  transactionDate?: string;
  vendor?: string;
  amount?: number;
  description?: string;
  orderId?: string;
  paymentMethod?: string;
}

// Export field configuration
export type ExportFieldKey = 
  | 'date'
  | 'vendor'
  | 'category'
  | 'description'
  | 'amount'
  | 'orderId'
  | 'paymentMethod'
  | 'fileName';

export interface ExportField {
  key: ExportFieldKey;
  label: string;
  enabled: boolean;
}

export const DEFAULT_EXPORT_FIELDS: ExportField[] = [
  { key: 'date', label: 'Date', enabled: true },
  { key: 'vendor', label: 'Vendor', enabled: true },
  { key: 'category', label: 'Category', enabled: true },
  { key: 'description', label: 'Description', enabled: true },
  { key: 'amount', label: 'Amount', enabled: true },
  { key: 'orderId', label: 'Order ID', enabled: false },
  { key: 'paymentMethod', label: 'Payment Method', enabled: false },
  { key: 'fileName', label: 'File Name', enabled: false },
];
