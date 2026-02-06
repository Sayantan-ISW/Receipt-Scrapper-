'use client';

import { useState, useEffect } from 'react';
import { ProcessedReceipt, DriveFile, ExportField, DEFAULT_EXPORT_FIELDS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReceiptsTable } from '@/components/receipts-table';
import { 
  Upload, 
  TrendingUp, 
  Receipt, 
  Download, 
  Moon, 
  Sun,
  ShoppingBag,
  Utensils,
  Car,
  Home as HomeIcon,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  Settings2,
  X,
  Check
} from 'lucide-react';

export default function Home() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [driveLink, setDriveLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [receipts, setReceipts] = useState<ProcessedReceipt[]>([]);
  const [error, setError] = useState('');
  const [showExportConfig, setShowExportConfig] = useState(false);
  const [exportFields, setExportFields] = useState<ExportField[]>(
    JSON.parse(JSON.stringify(DEFAULT_EXPORT_FIELDS))
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleField = (key: string) => {
    setExportFields(prev => 
      prev.map(field => 
        field.key === key ? { ...field, enabled: !field.enabled } : field
      )
    );
  };

  const handleFetchFiles = async () => {
    setError('');
    setLoading(true);
    setFiles([]);
    setReceipts([]);

    try {
      const response = await fetch('/api/drive/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderLink: driveLink }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch files');
      }

      setFiles(data.files);

      if (data.files.length === 0) {
        setError('No PDF files found in this folder');
        return;
      }

      await processFiles(data.files.map((f: DriveFile) => f.id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processFiles = async (fileIds: string[]) => {
    setProcessing(true);
    setError('');

    try {
      const response = await fetch('/api/process/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process files');
      }

      const receiptsWithNames = data.receipts.map((receipt: ProcessedReceipt) => {
        const file = files.find((f) => f.id === receipt.id);
        return {
          ...receipt,
          fileName: file?.name || receipt.id,
        };
      });

      setReceipts(receiptsWithNames);

      if (data.errors.length > 0) {
        console.warn('Processing errors:', data.errors);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receipts, selectedFields: exportFields }),
      });

      if (!response.ok) {
        throw new Error('Failed to export');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipts-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setShowExportConfig(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const totalSpent = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
  const averageSpent = receipts.length > 0 ? totalSpent / receipts.length : 0;
  
  const categoryTotals = receipts.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + (r.amount || 0);
    return acc;
  }, {} as Record<string, number>);

  const categoryIcons: Record<string, any> = {
    Food: Utensils,
    Travel: Car,
    Shopping: ShoppingBag,
    Utilities: HomeIcon,
    Other: Package,
  };

  const statusCounts = {
    processed: receipts.length,
    pending: processing ? files.length - receipts.length : 0,
    errors: 0
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Receipt Scanner
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Smart expense tracking</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 auto-rows-auto">
          
          {/* Upload Zone - Large 2x2 */}
          <Card className="md:col-span-2 lg:row-span-2 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-dashed border-2 border-slate-300 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-purple-600" />
                Upload Receipts
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-[300px] gap-6">
              <div className="p-8 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30">
                <Upload className="h-12 w-12 text-purple-600 dark:text-purple-400" />
              </div>
              
              <div className="w-full max-w-md space-y-4">
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Paste Google Drive Folder Link
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    Drag & drop or paste a public folder link
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={driveLink}
                    onChange={(e) => setDriveLink(e.target.value)}
                    className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                  />
                  <Button
                    onClick={handleFetchFiles}
                    disabled={loading || !driveLink}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                  >
                    {loading ? 'Processing...' : 'Scan'}
                  </Button>
                </div>
                
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                    <AlertCircle className="h-4 w-4 text-rose-600" />
                    <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Total Spent - Medium 1x1 */}
          <Card className="backdrop-blur-sm bg-gradient-to-br from-purple-500 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-purple-100">Total Spent</p>
                  <p className="text-4xl font-bold">₹{totalSpent.toFixed(2)}</p>
                  <div className="flex items-center gap-1 text-xs text-purple-100">
                    <TrendingUp className="h-3 w-3" />
                    <span>+12% from last month</span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-white/20">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Receipts Count - Small 1x1 */}
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Receipts</p>
                  <p className="text-4xl font-bold text-slate-900 dark:text-white">{receipts.length}</p>
                </div>
                <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <Receipt className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories - Medium 1x2 */}
          <Card className="lg:row-span-2 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(categoryTotals).map(([category, total]) => {
                  const Icon = categoryIcons[category] || Package;
                  const percentage = totalSpent > 0 ? (total / totalSpent) * 100 : 0;
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30">
                            <Icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {category}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          ₹{total.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                
                {receipts.length === 0 && (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No categories yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats - Small 1x1 */}
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Average</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    ₹{averageSpent.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500">per receipt</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Badges - Small 1x1 */}
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Processed</span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {statusCounts.processed}
                </span>
              </div>
              
              {processing && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600 animate-pulse" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Pending</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {statusCounts.pending}
                  </span>
                </div>
              )}
              
              {statusCounts.errors > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-600" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Errors</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {statusCounts.errors}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Table - Wide, full width */}
          {receipts.length > 0 && (
            <Card className="md:col-span-2 lg:col-span-4 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Receipt Details</CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {receipts.length} receipts • Click cells to edit
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowExportConfig(!showExportConfig)}
                    className="relative"
                    title="Configure export fields"
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleExport}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Excel
                  </Button>
                </div>
              </CardHeader>

              {/* Export Field Configuration */}
              {showExportConfig && (
                <div className="px-6 pb-4">
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Select Fields for Export
                      </h4>
                      <button 
                        onClick={() => setShowExportConfig(false)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                      >
                        <X className="h-4 w-4 text-slate-500" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {exportFields.map(field => (
                        <button
                          key={field.key}
                          onClick={() => toggleField(field.key)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                            field.enabled
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded flex items-center justify-center ${
                            field.enabled 
                              ? 'bg-purple-600 text-white' 
                              : 'border border-slate-300 dark:border-slate-600'
                          }`}>
                            {field.enabled && <Check className="h-3 w-3" />}
                          </div>
                          {field.label}
                        </button>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                      {exportFields.filter(f => f.enabled).length} fields selected for export
                    </p>
                  </div>
                </div>
              )}

              <CardContent>
                <ReceiptsTable receipts={receipts} onUpdate={setReceipts} />
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
