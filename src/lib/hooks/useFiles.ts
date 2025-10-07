import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { filesApi } from '@/lib/api/files';
import { FileData } from '@/types/api';

// Hook for getting file by ID
export const useFile = (fileId: string) => {
  return useQuery({
    queryKey: ['files', fileId],
    queryFn: () => filesApi.getFile(fileId),
    enabled: !!fileId,
  });
};

// Hook for getting file metadata
export const useFileMetadata = (fileId: string) => {
  return useQuery({
    queryKey: ['files', fileId, 'metadata'],
    queryFn: () => filesApi.getFileMetadata(fileId),
    enabled: !!fileId,
  });
};

// Hook for uploading single file
export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => filesApi.uploadFile(file),
    onSuccess: (data) => {
      toast.success(`File "${data.filename}" berhasil diupload`);
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal mengupload file');
    },
  });
};

// Hook for uploading multiple files
export const useUploadMultipleFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (files: File[]) => filesApi.uploadMultipleFiles(files),
    onSuccess: (data) => {
      toast.success(`${data.length} file berhasil diupload`);
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal mengupload file');
    },
  });
};

// Hook for downloading file
export const useDownloadFile = () => {
  return useMutation({
    mutationFn: (fileId: string) => filesApi.downloadFile(fileId),
    onSuccess: (_, fileId) => {
      toast.success('File berhasil didownload');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal mendownload file');
    },
  });
};

// Hook for deleting file
export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => filesApi.deleteFile(fileId),
    onSuccess: () => {
      toast.success('File berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus file');
    },
  });
};

// Hook for getting file preview URL
export const useFilePreviewUrl = (fileId: string) => {
  return filesApi.getFilePreviewUrl(fileId);
};

// Hook for getting file download URL
export const useFileDownloadUrl = (fileId: string) => {
  return filesApi.getFileDownloadUrl(fileId);
};