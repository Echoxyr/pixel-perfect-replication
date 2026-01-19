import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  Download,
  Trash2,
  Edit,
  Upload,
  FileText,
  Image as ImageIcon,
  File,
  ExternalLink,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFileUpload } from '@/hooks/useFileUpload';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export interface FileAttachment {
  id: string;
  name: string;
  url?: string;
  path?: string;
  size?: number;
  type?: string;
  uploadedAt?: string;
  description?: string;
}

interface FileAttachmentManagerProps {
  files: FileAttachment[];
  onUpload?: (file: File) => Promise<{ path: string; url: string; name: string } | null>;
  onDelete?: (fileId: string, filePath?: string) => Promise<boolean>;
  onUpdate?: (fileId: string, newFile: File) => Promise<boolean>;
  bucket?: string;
  folder?: string;
  allowUpload?: boolean;
  allowDelete?: boolean;
  allowEdit?: boolean;
  compact?: boolean;
  className?: string;
  emptyMessage?: string;
  title?: string;
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
    return <ImageIcon className="w-4 h-4 text-blue-500" />;
  }
  if (['pdf'].includes(ext || '')) {
    return <FileText className="w-4 h-4 text-red-500" />;
  }
  if (['doc', 'docx'].includes(ext || '')) {
    return <FileText className="w-4 h-4 text-blue-600" />;
  }
  if (['xls', 'xlsx'].includes(ext || '')) {
    return <FileText className="w-4 h-4 text-green-600" />;
  }
  return <File className="w-4 h-4 text-muted-foreground" />;
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function FileAttachmentManager({
  files,
  onUpload,
  onDelete,
  onUpdate,
  bucket = 'documenti',
  folder = 'attachments',
  allowUpload = true,
  allowDelete = true,
  allowEdit = true,
  compact = false,
  className,
  emptyMessage = 'Nessun file allegato',
  title,
}: FileAttachmentManagerProps) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileAttachment | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const { uploadFile, uploading, progress, deleteFile } = useFileUpload({
    bucket,
    folder,
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFile(file);
    }
  };

  const handleUpload = async () => {
    if (!pendingFile) return;

    try {
      if (onUpload) {
        const result = await onUpload(pendingFile);
        if (result) {
          toast.success('File caricato con successo');
        }
      } else {
        const result = await uploadFile(pendingFile);
        if (result) {
          toast.success('File caricato con successo');
        }
      }
      setPendingFile(null);
      setShowUploadDialog(false);
    } catch (error) {
      toast.error('Errore nel caricamento del file');
    }
  };

  const handleDelete = async (file: FileAttachment) => {
    setIsDeleting(file.id);
    try {
      if (onDelete) {
        const success = await onDelete(file.id, file.path);
        if (success) {
          toast.success('File eliminato');
        }
      } else if (file.path) {
        const success = await deleteFile(file.path);
        if (success) {
          toast.success('File eliminato');
        }
      }
    } catch (error) {
      toast.error('Errore nell\'eliminazione del file');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleUpdate = async () => {
    if (!selectedFile || !pendingFile) return;
    setIsUpdating(true);
    try {
      if (onUpdate) {
        const success = await onUpdate(selectedFile.id, pendingFile);
        if (success) {
          toast.success('File aggiornato');
          setShowEditDialog(false);
          setSelectedFile(null);
          setPendingFile(null);
        }
      }
    } catch (error) {
      toast.error('Errore nell\'aggiornamento del file');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleView = (file: FileAttachment) => {
    if (file.url) {
      window.open(file.url, '_blank');
    } else {
      toast.info('URL non disponibile');
    }
  };

  const handleDownload = async (file: FileAttachment) => {
    if (file.url) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.info('Download non disponibile');
    }
  };

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        {title && <p className="text-sm font-medium">{title}</p>}
        
        <div className="flex flex-wrap gap-2">
          {files.map((file) => (
            <TooltipProvider key={file.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg group">
                    {getFileIcon(file.name)}
                    <span className="text-sm max-w-[150px] truncate">{file.name}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleView(file)}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleDownload(file)}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      {allowDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500"
                          onClick={() => handleDelete(file)}
                          disabled={isDeleting === file.id}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{file.name}</p>
                  {file.size && <p className="text-xs">{formatFileSize(file.size)}</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          
          {allowUpload && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setShowUploadDialog(true)}
            >
              <Plus className="w-3 h-3" />
              Aggiungi
            </Button>
          )}
        </div>

        {files.length === 0 && !allowUpload && (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        )}

        {/* Upload Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Carica File</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload-compact"
                />
                <label htmlFor="file-upload-compact" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {pendingFile ? pendingFile.name : 'Clicca per selezionare un file'}
                  </p>
                </label>
              </div>
              {uploading && (
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                Annulla
              </Button>
              <Button onClick={handleUpload} disabled={!pendingFile || uploading}>
                {uploading ? 'Caricamento...' : 'Carica'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{title}</h3>
          {allowUpload && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowUploadDialog(true)}
            >
              <Upload className="w-4 h-4" />
              Carica File
            </Button>
          )}
        </div>
      )}

      {files.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-lg">
          <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>{emptyMessage}</p>
          {allowUpload && (
            <Button
              variant="link"
              className="mt-2"
              onClick={() => setShowUploadDialog(true)}
            >
              Carica il primo file
            </Button>
          )}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File</TableHead>
              <TableHead>Dimensione</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getFileIcon(file.name)}
                    <div>
                      <p className="font-medium">{file.name}</p>
                      {file.description && (
                        <p className="text-xs text-muted-foreground">{file.description}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{formatFileSize(file.size)}</TableCell>
                <TableCell>
                  {file.uploadedAt
                    ? format(new Date(file.uploadedAt), 'dd/MM/yyyy', { locale: it })
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleView(file)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Visualizza</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDownload(file)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Scarica</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {allowEdit && onUpdate && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedFile(file);
                                setShowEditDialog(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Modifica</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {allowDelete && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                              onClick={() => handleDelete(file)}
                              disabled={isDeleting === file.id}
                            >
                              {isDeleting === file.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Elimina</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Carica File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload-full"
              />
              <label htmlFor="file-upload-full" className="cursor-pointer">
                <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium">
                  {pendingFile ? pendingFile.name : 'Clicca o trascina un file'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PDF, DOC, XLS, immagini (max 50MB)
                </p>
              </label>
            </div>
            {uploading && (
              <div className="space-y-2">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Caricamento... {progress}%
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Annulla
            </Button>
            <Button onClick={handleUpload} disabled={!pendingFile || uploading}>
              {uploading ? 'Caricamento...' : 'Carica'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sostituisci File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">File attuale:</p>
              <div className="flex items-center gap-2 mt-1">
                {selectedFile && getFileIcon(selectedFile.name)}
                <span className="font-medium">{selectedFile?.name}</span>
              </div>
            </div>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload-edit"
              />
              <label htmlFor="file-upload-edit" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm">
                  {pendingFile ? pendingFile.name : 'Seleziona nuovo file'}
                </p>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annulla
            </Button>
            <Button onClick={handleUpdate} disabled={!pendingFile || isUpdating}>
              {isUpdating ? 'Aggiornamento...' : 'Sostituisci'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FileAttachmentManager;
