import { apiClient } from './client';
import { FileData } from '@/types/api';
import { createFileFormData, FileUploadResult } from '@/lib/utils/file-upload';

export const filesApi = {
  // Upload file (sesuai dengan backend endpoint /common/upload-file/)
  async uploadFile(file: File, caption?: string): Promise<FileData> {
    const formData = createFileFormData(file, caption);
    return apiClient.upload('/common/upload-file/', formData);
  },

  // Upload main image untuk Blog atau Event
  async uploadMainImage(file: File, caption?: string): Promise<FileUploadResult> {
    try {
      const result = await this.uploadFile(file, caption);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  },

  // Upload multiple files
  async uploadMultipleFiles(files: File[]): Promise<FileData[]> {
    const uploadPromises = files.map(file => this.uploadFile(file));
    return Promise.all(uploadPromises);
  },

  // Get file by ID (sesuai dengan backend endpoint /common/upload-file/{file_id}/)
  async getFile(fileId: string): Promise<FileData> {
    return apiClient.get(`/common/upload-file/${fileId}/`);
  },

  // Download file
  async downloadFile(fileId: string): Promise<Blob> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/common/upload-file/${fileId}/download/`, {
      headers: {
        Authorization: `Token ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    return response.blob();
  },

  // Get file metadata (sama dengan getFile)
  async getFileMetadata(fileId: string): Promise<FileData> {
    return this.getFile(fileId);
  },

  // Delete file
  async deleteFile(fileId: string): Promise<void> {
    return apiClient.delete(`/common/upload-file/${fileId}/`);
  },

  // Get file preview URL
  getFilePreviewUrl(fileId: string): string {
    const token = localStorage.getItem('auth_token');
    return `${import.meta.env.VITE_API_URL}/common/upload-file/${fileId}/preview/?token=${token}`;
  },

  // Get file download URL
  getFileDownloadUrl(fileId: string): string {
    const token = localStorage.getItem('auth_token');
    return `${import.meta.env.VITE_API_URL}/common/upload-file/${fileId}/download/?token=${token}`;
  },
};