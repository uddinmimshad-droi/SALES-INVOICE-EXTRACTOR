
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        invoiceSummary: {
            type: Type.ARRAY,
            description: "An array of objects, each representing an invoice summary.",
            items: {
                type: Type.OBJECT,
                properties: {
                    gstin: { type: Type.STRING, description: "The CUSTOMER's GST Identification Number. This should not be the supplier's GSTIN. If not available, it should be an empty string." },
                    customerName: { type: Type.STRING, description: "The name of the customer." },
                    invoiceNumber: { type: Type.STRING, description: "The unique invoice number." },
                    invoiceDate: { type: Type.STRING, description: "The date of the invoice (YYYY-MM-DD)." },
                    invoiceValue: { type: Type.NUMBER, description: "The total value of the invoice." },
                    gstRate: { type: Type.STRING, description: "The primary or a comma-separated list of GST rates applicable." },
                    taxableValue: { type: Type.NUMBER, description: "The total taxable value." },
                    igst: { type: Type.NUMBER, description: "The total IGST amount." },
                    cgst: { type: Type.NUMBER, description: "The total CGST amount." },
                    sgst: { type: Type.NUMBER, description: "The total SGST amount." },
                    cess: { type: Type.NUMBER, description: "The total CESS amount." },
                },
                required: ["gstin", "customerName", "invoiceNumber", "invoiceDate", "invoiceValue", "taxableValue"],
            },
        },
        invoiceItems: {
            type: Type.ARRAY,
            description: "An array of objects, each representing a line item from the invoice(s).",
            items: {
                type: Type.OBJECT,
                properties: {
                    invoiceNumber: { type: Type.STRING, description: "The invoice number this line item belongs to." },
                    gstRate: { type: Type.STRING, description: "The GST rate for the line item." },
                    hsnCode: { type: Type.STRING, description: "The HSN code for the product/service." },
                    quantity: { type: Type.NUMBER, description: "The quantity of the item." },
                    taxableValue: { type: Type.NUMBER, description: "The taxable value of the line item." },
                    igst: { type: Type.NUMBER, description: "The IGST amount for the line item." },
                    cgst: { type: Type.NUMBER, description: "The CGST amount for the line item." },
                    sgst: { type: Type.NUMBER, description: "The SGST amount for the line item." },
                },
                required: ["invoiceNumber", "hsnCode", "quantity", "taxableValue"],
            },
        },
    },
    required: ["invoiceSummary", "invoiceItems"],
};

export const analyzeDocument = async (mimeType: string, base64Data: string): Promise<ExtractedData> => {
  const filePart = {
    inlineData: {
      mimeType,
      data: base64Data,
    },
  };

  const textPart = {
    text: `You are an expert invoice data extraction tool for Indian GST invoices. Analyze the provided document (which could be a PDF, DOC, or CSV). Your task is to extract all invoice details and format them into a JSON object.

    The JSON object must contain two keys: 'invoiceSummary' and 'invoiceItems'.
    
    For 'invoiceSummary', create an array of objects, where each object represents a single invoice found in the document. For each invoice, extract the following fields:
    - 'gstin': It is crucial that you extract the CUSTOMER's GST Identification Number. Invoices often have two GSTINs (supplier and customer/buyer). You must identify and provide only the customer's. If the customer's GSTIN is not present on the invoice, leave this field as an empty string.
    - 'customerName'
    - 'invoiceNumber'
    - 'invoiceDate'
    - 'invoiceValue'
    - 'gstRate'
    - 'taxableValue'
    - 'igst'
    - 'cgst'
    - 'sgst'
    - 'cess'
    If a value for any field other than 'gstin' is not found, use an empty string or 0 for numeric fields.
    
    For 'invoiceItems', create an array of objects, where each object represents a distinct line item from all invoices in the document. For each line item, extract: 'invoiceNumber' (the invoice number from which this line item was taken), 'gstRate', 'hsnCode', 'quantity', 'taxableValue', 'igst', 'cgst', 'sgst'. It is very important to correctly associate each line item with its parent invoice number. If a value is not found, use an empty string or 0 for numeric fields.
    
    Strictly adhere to the provided JSON schema. Do not include any extra text, explanations, or markdown formatting in your response. The output must be a clean, parseable JSON object.`,
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [filePart, textPart] },
    config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
    }
  });

  try {
    const text = response.text.trim();
    // The Gemini API with JSON schema mode should return a valid JSON string.
    const parsedData = JSON.parse(text);
    // Basic validation to ensure the structure is what we expect
    if (parsedData.invoiceSummary && parsedData.invoiceItems) {
      return parsedData as ExtractedData;
    } else {
      throw new Error("Parsed JSON does not match the expected structure.");
    }
  } catch (e) {
    console.error("Failed to parse Gemini response as JSON:", e);
    console.error("Raw response text:", response.text);
    throw new Error("Could not parse the analysis result. The AI model returned an unexpected format.");
  }
};
