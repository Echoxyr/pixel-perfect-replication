import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface ExportButtonProps {
  data: Record<string, any>[];
  filename: string;
  columns?: { key: string; label: string }[];
  className?: string;
}

export function ExportButton({ data, filename, columns, className }: ExportButtonProps) {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const getHeaders = () => {
    if (columns) return columns;
    if (data.length === 0) return [];
    return Object.keys(data[0]).map(key => ({ key, label: key }));
  };

  const exportToCSV = () => {
    setExporting(true);
    try {
      const headers = getHeaders();
      const headerRow = headers.map(h => h.label).join(',');
      const rows = data.map(item => 
        headers.map(h => {
          const value = item[h.key];
          // Escape quotes and wrap in quotes if contains comma
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? '';
        }).join(',')
      );
      
      const csv = [headerRow, ...rows].join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      downloadBlob(blob, `${filename}.csv`);
      toast({ title: 'Export completato', description: `${data.length} righe esportate in CSV` });
    } catch (error) {
      toast({ title: 'Errore export', description: 'Impossibile esportare i dati', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const exportToExcel = () => {
    setExporting(true);
    try {
      const headers = getHeaders();
      const wsData = [
        headers.map(h => h.label),
        ...data.map(item => headers.map(h => item[h.key] ?? ''))
      ];
      
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Dati');
      
      // Auto-size columns
      const colWidths = headers.map((h, i) => {
        const maxLen = Math.max(
          h.label.length,
          ...data.map(item => String(item[h.key] ?? '').length)
        );
        return { wch: Math.min(maxLen + 2, 50) };
      });
      ws['!cols'] = colWidths;
      
      XLSX.writeFile(wb, `${filename}.xlsx`);
      toast({ title: 'Export completato', description: `${data.length} righe esportate in Excel` });
    } catch (error) {
      toast({ title: 'Errore export', description: 'Impossibile esportare i dati', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const exportToJSON = () => {
    setExporting(true);
    try {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      downloadBlob(blob, `${filename}.json`);
      toast({ title: 'Export completato', description: `${data.length} righe esportate in JSON` });
    } catch (error) {
      toast({ title: 'Errore export', description: 'Impossibile esportare i dati', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (data.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className} disabled={exporting}>
          {exporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Esporta
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
          Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV}>
          <FileText className="w-4 h-4 mr-2 text-blue-600" />
          CSV (.csv)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          <FileText className="w-4 h-4 mr-2 text-amber-600" />
          JSON (.json)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
