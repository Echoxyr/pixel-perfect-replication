import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UploadOptions {
  bucket?: string;
  folder?: string;
  maxSize?: number; // in MB
  allowedTypes?: string[];
}

interface UploadResult {
  path: string;
  url: string;
  name: string;
  size: number;
  type: string;
}

export function useFileUpload(options: UploadOptions = {}) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const {
    bucket = 'documenti',
    folder = '',
    maxSize = 10, // 10MB default
    allowedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx'],
  } = options;

  const uploadFile = async (file: File): Promise<UploadResult | null> => {
    if (!file) return null;

    // Verifica dimensione
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: 'File troppo grande',
        description: `Il file non può superare ${maxSize}MB`,
        variant: 'destructive',
      });
      return null;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Genera nome file unico
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = folder 
        ? `${folder}/${timestamp}-${sanitizedName}`
        : `${timestamp}-${sanitizedName}`;

      // Upload
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Ottieni URL pubblico o signed
      const { data: urlData } = await supabase.storage
        .from(bucket)
        .createSignedUrl(data.path, 60 * 60 * 24 * 365); // 1 anno

      setProgress(100);

      toast({
        title: 'File caricato',
        description: `${file.name} caricato con successo`,
      });

      return {
        path: data.path,
        url: urlData?.signedUrl || '',
        name: file.name,
        size: file.size,
        type: file.type,
      };
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Errore upload',
        description: error.message || 'Si è verificato un errore durante il caricamento',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadMultiple = async (files: FileList | File[]): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];
    const fileArray = Array.from(files);

    for (let i = 0; i < fileArray.length; i++) {
      const result = await uploadFile(fileArray[i]);
      if (result) {
        results.push(result);
      }
      setProgress(Math.round(((i + 1) / fileArray.length) * 100));
    }

    return results;
  };

  const deleteFile = async (path: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;

      toast({
        title: 'File eliminato',
        description: 'Il file è stato eliminato con successo',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Errore eliminazione',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const getSignedUrl = async (path: string, expiresIn = 3600): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) throw error;
      return data.signedUrl;
    } catch {
      return null;
    }
  };

  return {
    uploadFile,
    uploadMultiple,
    deleteFile,
    getSignedUrl,
    uploading,
    progress,
  };
}
