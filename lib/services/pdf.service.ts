/**
 * PDF Processing Service
 * Extracts text content from PDF buffers
 */
export class PDFService {
  /**
   * Extract text from a PDF buffer
   */
  async extractText(buffer: Buffer): Promise<string> {
    try {
      const pdfParse = require('pdf-parse/lib/pdf-parse.js');
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error: any) {
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
  }

  /**
   * Validate if buffer is a valid PDF
   */
  isValidPDF(buffer: Buffer): boolean {
    // PDF files start with %PDF-
    const header = buffer.slice(0, 5).toString('utf-8');
    return header === '%PDF-';
  }
}
