import { apiClient } from './client';
import { FileData } from '@/types/api';

export const filesApi = {
  // Upload file
  async uploadFile(file: File): Promise<FileData> {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.upload('/file/upload/', formData);
  },

  // Upload multiple files
  async uploadMultipleFiles(files: File[]): Promise<FileData[]> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });

    return apiClient.upload('/file/upload/multiple/', formData);
  },

  // Get file by ID
  async getFile(fileId: string): Promise<FileData> {
    return apiClient.get(`/file/${fileId}/`);
  },

  // Download file
  async downloadFile(fileId: string): Promise<Blob> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/file/${fileId}/download/`, {
      headers: {
        Authorization: `Token ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    return response.blob();
  },

  // Get file metadata
  async getFileMetadata(fileId: string): Promise<FileData> {
    return apiClient.get(`/file/${fileId}/metadata/`);
  },

  // Delete file
  async deleteFile(fileId: string): Promise<void> {
    return apiClient.delete(`/file/${fileId}/`);
  },

  // Get file preview URL
  getFilePreviewUrl(fileId: string): string {
    const token = localStorage.getItem('auth_token');
    return `${import.meta.env.VITE_API_URL}/file/${fileId}/preview/?token=${token}`;
  },

  // Get file download URL
  getFileDownloadUrl(fileId: string): string {
    const token = localStorage.getItem('auth_token');
    return `${import.meta.env.VITE_API_URL}/file/${fileId}/download/?token=${token}`;
  },
};