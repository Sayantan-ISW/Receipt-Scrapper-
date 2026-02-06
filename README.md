# Receipt Processor

A full-stack Next.js application that automatically processes PDF receipts from Google Drive and exports them to Excel.

**Link**-https://receipt-scraper.vercel.app/

## Features

- 📁 **Google Drive Integration** - Fetch PDFs from public Drive folders
- 📄 **PDF Text Extraction** - Extract text from digital receipts
- 🤖 **Smart Data Extraction** - Regex-based parsing for dates, vendors, amounts
- 🏷️ **Auto-Categorization** - Keyword-based expense categorization
- ✏️ **Editable Results** - Review and correct extracted data
- 📊 **Excel Export** - Download formatted Excel spreadsheets

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **PDF Processing**: pdf-parse
- **Drive API**: googleapis
- **Excel Generation**: exceljs

## Setup

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   Create a `.env.local` file:
   ```env
   GOOGLE_DRIVE_API_KEY=your_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Get Google Drive API Key**
   
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable **Google Drive API**
   - Create credentials → API Key
   - Copy the API key to `.env.local`

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   
   Navigate to `http://localhost:3000`

## Usage

1. Share a Google Drive folder publicly (Anyone with the link can view)
2. Add PDF receipts to the folder
3. Copy the folder link
4. Paste the link in the app and click "Process"
5. Review and edit extracted data
6. Click "Export to Excel" to download

## API Routes

- `POST /api/drive/list` - List PDFs in a Drive folder
- `POST /api/process/batch` - Process PDFs and extract data
- `POST /api/export` - Generate Excel file

## Project Structure

```
receipt-processor/
├── app/
│   ├── api/
│   │   ├── drive/list/route.ts       # List PDFs from Drive
│   │   ├── process/batch/route.ts    # Process and extract data
│   │   └── export/route.ts           # Generate Excel
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                            # shadcn/ui components
│   └── receipts-table.tsx
├── lib/
│   ├── services/                      # Business logic services
│   │   ├── drive.service.ts
│   │   ├── pdf.service.ts
│   │   ├── extraction.service.ts
│   │   ├── categorization.service.ts
│   │   └── excel.service.ts
│   ├── types/                         # TypeScript types
│   │   └── index.ts
│   ├── constants/                     # Configuration
│   │   └── categories.ts
│   └── utils.ts
└── .env.local
```

See [STRUCTURE.md](STRUCTURE.md) for detailed folder organization documentation.

## License

MIT
