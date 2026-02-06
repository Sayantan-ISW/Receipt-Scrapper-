import { NextRequest, NextResponse } from 'next/server';
import { DriveService } from '@/lib/services/drive.service';

export async function POST(request: NextRequest) {
  try {
    const { folderLink } = await request.json();

    if (!folderLink) {
      return NextResponse.json(
        { error: 'Folder link is required' },
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
    const folderId = driveService.extractFolderId(folderLink);

    if (!folderId) {
      return NextResponse.json(
        { error: 'Invalid Google Drive folder link' },
        { status: 400 }
      );
    }

    const files = await driveService.listPDFsInFolder(folderId);

    return NextResponse.json({
      success: true,
      folderId,
      files,
      count: files.length,
    });
  } catch (error: any) {
    console.error('Drive list error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list files' },
      { status: 500 }
    );
  }
}
