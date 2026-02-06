import { NextRequest, NextResponse } from 'next/server';
import { DriveService } from '@/lib/services/drive.service';
import { PDFService } from '@/lib/services/pdf.service';
import { ExtractionService } from '@/lib/services/extraction.service';
import { CategorizationService } from '@/lib/services/categorization.service';
import { ProcessedReceipt } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { fileIds } = await request.json();

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json(
        { error: 'File IDs array is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Drive API key not configured' },
        { status: 500 }
      );
    }

    const driveService = new DriveService(apiKey);
    const pdfService = new PDFService();
    const extractionService = new ExtractionService();
    const categorizationService = new CategorizationService();

    const results: ProcessedReceipt[] = [];
    const errors: string[] = [];

    // Process each file
    for (const fileId of fileIds) {
      try {
        // Download file
        const buffer = await driveService.downloadFile(fileId);

        // Validate PDF
        if (!pdfService.isValidPDF(buffer)) {
          errors.push(`File ${fileId} is not a valid PDF`);
          continue;
        }

        // Extract text
        const text = await pdfService.extractText(buffer);

        if (!text || text.trim().length === 0) {
          errors.push(`File ${fileId} contains no extractable text`);
          continue;
        }

        // Extract data
        const extracted = extractionService.extract(text);

        // Categorize
        const category = categorizationService.categorize(
          extracted.vendor || '',
          extracted.description
        );

        // Build result
        const receipt: ProcessedReceipt = {
          id: fileId,
          fileName: fileId, // We'll update this with actual filename from frontend
          transactionDate: extracted.transactionDate || 'N/A',
          vendor: extracted.vendor || 'Unknown',
          amount: extracted.amount || 0,
          description: extracted.description || '',
          category,
          orderId: extracted.orderId,
          paymentMethod: extracted.paymentMethod,
          rawText: text.substring(0, 500), // Store first 500 chars for debugging
        };

        results.push(receipt);
      } catch (error: any) {
        errors.push(`Error processing file ${fileId}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      receipts: results,
      errors,
      totalProcessed: results.length,
    });
  } catch (error: any) {
    console.error('Processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process files' },
      { status: 500 }
    );
  }
}
