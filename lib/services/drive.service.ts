import { google } from 'googleapis';
import { DriveFile } from '../types';

/**
 * Google Drive Service
 * Handles fetching PDF files from public Google Drive folders
 */
export class DriveService {
  private drive;

  constructor(apiKey: string) {
    this.drive = google.drive({
      version: 'v3',
      auth: apiKey,
    });
  }

  /**
   * Extract folder ID from Google Drive URL
   * Supports formats:
   * - https://drive.google.com/drive/folders/FOLDER_ID
   * - https://drive.google.com/drive/u/0/folders/FOLDER_ID
   */
  extractFolderId(url: string): string | null {
    const patterns = [
      /\/folders\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * List all PDF files in a public folder
   */
  async listPDFsInFolder(folderId: string): Promise<DriveFile[]> {
    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and mimeType='application/pdf' and trashed=false`,
        fields: 'files(id, name, mimeType, size)',
        pageSize: 100,
      });

      return (response.data.files || []).map((file) => ({
        id: file.id!,
        name: file.name!,
        mimeType: file.mimeType!,
        size: file.size ? parseInt(file.size) : undefined,
      }));
    } catch (error: any) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  /**
   * Download a file as a buffer
   */
  async downloadFile(fileId: string): Promise<Buffer> {
    try {
      const response = await this.drive.files.get(
        {
          fileId: fileId,
          alt: 'media',
        },
        {
          responseType: 'arraybuffer',
        }
      );

      return Buffer.from(response.data as ArrayBuffer);
    } catch (error: any) {
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }
}
