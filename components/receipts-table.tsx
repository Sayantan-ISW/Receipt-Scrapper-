'use client';

import { ProcessedReceipt, ExpenseCategory } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ReceiptsTableProps {
  receipts: ProcessedReceipt[];
  onUpdate: (receipts: ProcessedReceipt[]) => void;
}

export function ReceiptsTable({ receipts, onUpdate }: ReceiptsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCellEdit = (id: string, field: keyof ProcessedReceipt, value: string) => {
    const updated = receipts.map((receipt) => {
      if (receipt.id === id) {
        if (field === 'amount') {
          return { ...receipt, [field]: parseFloat(value) || 0 };
        }
        return { ...receipt, [field]: value };
      }
      return receipt;
    });
    onUpdate(updated);
  };

  const handleDelete = (id: string) => {
    const updated = receipts.filter((r) => r.id !== id);
    onUpdate(updated);
  };

  const totalAmount = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);

  const categoryTotals = receipts.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + (r.amount || 0);
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.map((receipt) => (
              <TableRow key={receipt.id}>
                <TableCell>
                  <Input
                    value={receipt.transactionDate}
                    onChange={(e) =>
                      handleCellEdit(receipt.id, 'transactionDate', e.target.value)
                    }
                    className="h-8 border-0 focus-visible:ring-1 min-w-[100px]"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={receipt.vendor}
                    onChange={(e) =>
                      handleCellEdit(receipt.id, 'vendor', e.target.value)
                    }
                    className="h-8 border-0 focus-visible:ring-1 min-w-[120px] font-medium"
                  />
                </TableCell>
                <TableCell>
                  <select
                    value={receipt.category}
                    onChange={(e) =>
                      handleCellEdit(receipt.id, 'category', e.target.value)
                    }
                    className="h-9 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[110px] cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 transition-colors"
                  >
                    <option value="Food" className="py-2">🍔 Food</option>
                    <option value="Travel" className="py-2">✈️ Travel</option>
                    <option value="Shopping" className="py-2">🛍️ Shopping</option>
                    <option value="Utilities" className="py-2">⚡ Utilities</option>
                    <option value="Other" className="py-2">📦 Other</option>
                  </select>
                </TableCell>
                <TableCell>
                  <Input
                    value={receipt.description}
                    onChange={(e) =>
                      handleCellEdit(receipt.id, 'description', e.target.value)
                    }
                    className="h-8 border-0 focus-visible:ring-1 min-w-[150px]"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={receipt.orderId || ''}
                    onChange={(e) =>
                      handleCellEdit(receipt.id, 'orderId', e.target.value)
                    }
                    placeholder="—"
                    className="h-8 border-0 focus-visible:ring-1 min-w-[100px] text-xs font-mono"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={receipt.paymentMethod || ''}
                    onChange={(e) =>
                      handleCellEdit(receipt.id, 'paymentMethod', e.target.value)
                    }
                    placeholder="—"
                    className="h-8 border-0 focus-visible:ring-1 min-w-[90px] text-xs"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-slate-500 text-sm">₹</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={receipt.amount}
                      onChange={(e) =>
                        handleCellEdit(receipt.id, 'amount', e.target.value)
                      }
                      className="h-8 border-0 text-right focus-visible:ring-1 no-spinner min-w-[70px]"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(receipt.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {Object.entries(categoryTotals).map(([category, total]) => (
          <div
            key={category}
            className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
          >
            <div className="text-sm font-medium text-muted-foreground">
              {category}
            </div>
            <div className="text-2xl font-bold">
              ₹{total.toFixed(2)}
            </div>
          </div>
        ))}
        <div className="rounded-lg border bg-primary p-4 text-primary-foreground shadow-sm">
          <div className="text-sm font-medium">Total</div>
          <div className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
