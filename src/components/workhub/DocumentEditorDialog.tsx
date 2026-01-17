import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from './RichTextEditor';
import { Save, FileDown, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  initialContent?: string;
  documentName?: string;
  onSave?: (data: { name: string; content: string }) => void;
  onExportPDF?: (html: string) => void;
  readOnly?: boolean;
}

export function DocumentEditorDialog({
  open,
  onOpenChange,
  title = 'Editor Documento',
  initialContent = '',
  documentName = '',
  onSave,
  onExportPDF,
  readOnly = false,
}: DocumentEditorDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState(documentName);
  const [content, setContent] = useState(initialContent);

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: 'Nome richiesto',
        description: 'Inserisci un nome per il documento',
        variant: 'destructive',
      });
      return;
    }
    
    onSave?.({ name, content });
    toast({
      title: 'Documento salvato',
      description: `"${name}" salvato con successo`,
    });
    onOpenChange(false);
  };

  const handleExportPDF = (html: string) => {
    if (onExportPDF) {
      onExportPDF(html);
    } else {
      // Default export to print
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="it">
        <head>
          <meta charset="UTF-8">
          <title>${name || 'Documento'}</title>
          <style>
            @page { size: A4; margin: 25mm 20mm; }
            body { 
              font-family: Arial, sans-serif; 
              font-size: 10pt; 
              line-height: 1.5; 
              color: #000; 
              text-align: justify;
            }
            h1 { font-size: 16pt; margin-bottom: 12pt; }
            h2 { font-size: 14pt; margin-bottom: 10pt; }
            h3 { font-size: 12pt; margin-bottom: 8pt; }
            p { margin-bottom: 8pt; }
            ul, ol { margin-left: 20pt; margin-bottom: 8pt; }
          </style>
        </head>
        <body>
          <h1 style="text-align: center; margin-bottom: 24pt;">${name || 'Documento'}</h1>
          ${html}
        </body>
        </html>
      `;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 250);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {!readOnly && (
            <div>
              <Label>Nome Documento</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Es. POS Cantiere Milano"
                className="mt-1"
              />
            </div>
          )}

          <div>
            <Label>Contenuto</Label>
            <div className="mt-1">
              <RichTextEditor
                content={content}
                onChange={setContent}
                onExportPDF={handleExportPDF}
                readOnly={readOnly}
                className="min-h-[400px]"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            Chiudi
          </Button>
          {!readOnly && (
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Salva Documento
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
