
import React, { useState, useCallback } from 'react';
import { InvoiceSummary, InvoiceItem, ExtractedData } from './types';
import { analyzeDocument } from './services/geminiService';
import { jsonToCsv, downloadCsv } from './utils/csvHelper';
import { fileToBase64 } from './utils/fileHelper';

import FileUpload from './components/FileUpload';
import DataTable from './components/DataTable';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((selectedFiles: File[] | null) => {
    setFiles(selectedFiles || []);
    setExtractedData(null);
    setError(null);
  }, []);

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError('Please select one or more files first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setExtractedData(null);

    try {
      const analysisPromises = files.map(async (file) => {
        const base64Data = await fileToBase64(file);
        return analyzeDocument(file.type, base64Data);
      });

      const results = await Promise.all(analysisPromises);
      
      const aggregatedData: ExtractedData = results.reduce<ExtractedData>(
        (acc, current) => {
          if (current?.invoiceSummary) {
            acc.invoiceSummary.push(...current.invoiceSummary);
          }
          if (current?.invoiceItems) {
            acc.invoiceItems.push(...current.invoiceItems);
          }
          return acc;
        },
        { invoiceSummary: [], invoiceItems: [] }
      );

      setExtractedData(aggregatedData);

    } catch (err) {
      console.error(err);
      setError('Failed to analyze one or more documents. Some documents might be corrupted or in an unsupported format. Please review your selection and try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (!extractedData) return;
    const { invoiceSummary, invoiceItems } = extractedData;
    
    const summaryCsv = jsonToCsv(invoiceSummary);
    const itemsCsv = jsonToCsv(invoiceItems);
    
    const combinedCsv = `Invoice Summary\n${summaryCsv}\n\nInvoice Items\n${itemsCsv}`;
    
    downloadCsv(combinedCsv, 'gst_invoice_data.csv');
  };

  // Fix: Explicitly type columns to match `keyof InvoiceSummary` for the key property.
  const invoiceSummaryColumns: { key: keyof InvoiceSummary; name: string }[] = [
    { key: 'gstin', name: 'GSTIN' },
    { key: 'customerName', name: 'Customer Name' },
    { key: 'invoiceNumber', name: 'Invoice No.' },
    { key: 'invoiceDate', name: 'Invoice Date' },
    { key: 'invoiceValue', name: 'Invoice Value' },
    { key: 'taxableValue', name: 'Taxable Value' },
    { key: 'gstRate', name: 'GST Rate' },
    { key: 'igst', name: 'IGST' },
    { key: 'cgst', name: 'CGST' },
    { key: 'sgst', name: 'SGST' },
    { key: 'cess', name: 'CESS' },
  ];

  // Fix: Explicitly type columns to match `keyof InvoiceItem` for the key property.
  const invoiceItemsColumns: { key: keyof InvoiceItem; name: string }[] = [
    { key: 'invoiceNumber', name: 'Invoice No.' },
    { key: 'hsnCode', name: 'HSN Code' },
    { key: 'gstRate', name: 'GST Rate' },
    { key: 'quantity', name: 'Quantity' },
    { key: 'taxableValue', name: 'Taxable Value' },
    { key: 'igst', name: 'IGST' },
    { key: 'cgst', name: 'CGST' },
    { key: 'sgst', name: 'SGST' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
            GST Invoice Extractor AI
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Upload your PDF, DOCX, or CSV invoices, and let our AI instantly extract and organize key data for you.
          </p>
        </header>

        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 md:p-8 border border-slate-200 dark:border-slate-700">
          <FileUpload onFileChange={handleFileChange} />
          
          <div className="mt-6 text-center">
            <button
              onClick={handleAnalyze}
              disabled={files.length === 0 || isLoading}
              className="w-full md:w-auto px-8 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:dark:bg-slate-600 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Documents'}
            </button>
          </div>

          {error && <p className="mt-4 text-center text-red-500 bg-red-100 dark:bg-red-900/20 p-3 rounded-lg">{error}</p>}
        </div>

        {isLoading && <Spinner />}

        {extractedData && (
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300">Extraction Results</h2>
                <button
                onClick={handleDownload}
                className="px-6 py-2 font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800"
                >
                Download CSV
                </button>
            </div>
            
            <div className="mb-10">
              <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-300">Invoice Summary</h3>
              <DataTable<InvoiceSummary> columns={invoiceSummaryColumns} data={extractedData.invoiceSummary} />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-300">Invoice Line Items</h3>
              <DataTable<InvoiceItem> columns={invoiceItemsColumns} data={extractedData.invoiceItems} />
            </div>
          </div>
        )}

      </main>
       <footer className="text-center py-6 text-sm text-slate-500 dark:text-slate-400">
            <p>Powered by Google Gemini</p>
        </footer>
    </div>
  );
};

export default App;
