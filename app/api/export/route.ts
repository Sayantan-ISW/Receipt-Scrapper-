import { NextRequest, NextResponse } from 'next/server';
import { ExcelService } from '@/lib/services/excel.service';
import { ProcessedReceipt, ExportField } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { receipts, selectedFields } = await request.json();

    if (!receipts || !Array.isArray(receipts)) {
      return NextResponse.json(
        { error: 'Receipts array is required' },
        { status: 400 }
      );
    }

    const excelService = new ExcelService();
    const buffer = await excelService.generateExcel(
      receipts as ProcessedReceipt[],
      selectedFields as ExportField[] | undefined
    );

    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="receipts-${Date.now()}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate Excel file' },
      { status: 500 }
    );
  }
}
