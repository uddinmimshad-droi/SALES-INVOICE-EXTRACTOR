
export interface InvoiceSummary {
  gstin: string;
  customerName: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceValue: number | string;
  gstRate: string;
  taxableValue: number | string;
  igst: number | string;
  cgst: number | string;
  sgst: number | string;
  cess: number | string;
}

export interface InvoiceItem {
  invoiceNumber: string;
  gstRate: string;
  hsnCode: string;
  quantity: number | string;
  taxableValue: number | string;
  igst: number | string;
  cgst: number | string;
  sgst: number | string;
}

export interface ExtractedData {
  invoiceSummary: InvoiceSummary[];
  invoiceItems: InvoiceItem[];
}
