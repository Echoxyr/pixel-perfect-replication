import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  ExternalLink,
  Edit,
  Trash2,
  FileText,
  Image as ImageIcon,
  File,
  X,
  Maximize2,
  Printer,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FileViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: {
    name: string;
    url: string;
    type?: string;
    size?: number;
    path?: string;
  } | null;
  onDelete?: () => Promise<void>;
  onDownload?: () => void;
  allowDelete?: boolean;
}

const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

const getFileType = (fileName: string): 'pdf' | 'image' | 'office' | 'other' => {
  const ext = getFileExtension(fileName);
  if (['pdf'].includes(ext)) return 'pdf';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image';
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return 'office';
  return 'other';
};

const getFileIcon = (fileName: string) => {
  const type = getFileType(fileName);
  switch (type) {
    case 'pdf':
      return <FileText className="w-5 h-5 text-red-500" />;
    case 'image':
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    case 'office':
      return <FileText className="w-5 h-5 text-blue-600" />;
    default:
      return <File className="w-5 h-5 text-muted-foreground" />;
  }
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Get Office Online viewer URL (free, no API key needed)
const getOfficeViewerUrl = (fileUrl: string): string => {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
};

// Get Google Docs viewer URL (alternative, also free)
const getGoogleDocsViewerUrl = (fileUrl: string): string => {
  return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
};

export function FileViewerModal({
  open,
  onOpenChange,
  file,
  onDelete,
  onDownload,
  allowDelete = true,
}: FileViewerModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewerError, setViewerError] = useState(false);
  const [useGoogleViewer, setUseGoogleViewer] = useState(false);

  if (!file) return null;

  const fileType = getFileType(file.name);
  const ext = getFileExtension(file.name);

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete();
      toast.success('File eliminato');
      onOpenChange(false);
    } catch (error) {
      toast.error("Errore nell'eliminazione");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (file.url) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenExternal = () => {
    window.open(file.url, '_blank');
  };

  const handlePrint = () => {
    const printWindow = window.open(file.url, '_blank');
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        printWindow.print();
      });
    }
  };

  const renderViewer = () => {
    // Handle images
    if (fileType === 'image') {
      return (
        <div className="flex items-center justify-center bg-muted/50 rounded-lg p-4 min-h-[400px]">
          <img
            src={file.url}
            alt={file.name}
            className="max-w-full max-h-[60vh] object-contain rounded"
          />
        </div>
      );
    }

    // Handle PDFs - use Adobe Acrobat free embed or browser native
    if (fileType === 'pdf') {
      return (
        <div className="w-full min-h-[500px] bg-muted/50 rounded-lg overflow-hidden">
          <iframe
            src={`${file.url}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-[60vh]"
            title={file.name}
          />
        </div>
      );
    }

    // Handle Office documents - use Microsoft Office Online Viewer (FREE)
    if (fileType === 'office') {
      const viewerUrl = useGoogleViewer 
        ? getGoogleDocsViewerUrl(file.url)
        : getOfficeViewerUrl(file.url);

      return (
        <div className="w-full min-h-[500px] bg-muted/50 rounded-lg overflow-hidden">
          {viewerError ? (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
              <FileText className="w-16 h-16 text-muted-foreground" />
              <p className="text-muted-foreground">Impossibile visualizzare il file inline</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setUseGoogleViewer(!useGoogleViewer)}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Prova {useGoogleViewer ? 'Office Viewer' : 'Google Viewer'}
                </Button>
                <Button onClick={handleOpenExternal}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Apri in nuova scheda
                </Button>
              </div>
            </div>
          ) : (
            <iframe
              src={viewerUrl}
              className="w-full h-[60vh]"
              title={file.name}
              onError={() => setViewerError(true)}
            />
          )}
          <div className="p-2 bg-muted/30 border-t flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Visualizzato con {useGoogleViewer ? 'Google Docs Viewer' : 'Microsoft Office Online'}
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setUseGoogleViewer(!useGoogleViewer)}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Cambia viewer
            </Button>
          </div>
        </div>
      );
    }

    // Fallback for other file types
    return (
      <div className="flex flex-col items-center justify-center bg-muted/50 rounded-lg p-8 min-h-[300px] gap-4">
        <File className="w-16 h-16 text-muted-foreground" />
        <p className="text-muted-foreground text-center">
          Anteprima non disponibile per file .{ext}
        </p>
        <Button onClick={handleOpenExternal}>
          <ExternalLink className="w-4 h-4 mr-2" />
          Apri in nuova scheda
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4 pr-8">
            <div className="flex items-center gap-3 min-w-0">
              {getFileIcon(file.name)}
              <div className="min-w-0">
                <DialogTitle className="truncate">{file.name}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    .{ext.toUpperCase()}
                  </Badge>
                  {file.size && (
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          {renderViewer()}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2 flex-1">
            <Button variant="outline" onClick={handleDownload} className="gap-2">
              <Download className="w-4 h-4" />
              Scarica
            </Button>
            <Button variant="outline" onClick={handleOpenExternal} className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Apri Esterno
            </Button>
            {fileType === 'pdf' && (
              <Button variant="outline" onClick={handlePrint} className="gap-2">
                <Printer className="w-4 h-4" />
                Stampa
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {allowDelete && onDelete && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="gap-2"
              >
                {isDeleting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Elimina
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4 mr-2" />
              Chiudi
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
