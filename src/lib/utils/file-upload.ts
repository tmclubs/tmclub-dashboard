import { z } from 'zod';
import { env } from '@/lib/config/env';

// File upload configuration
export const FILE_UPLOAD_CONFIG = {
  maxSize: env.maxFileSize,
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
} as const;

// File validation schema
export const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= FILE_UPLOAD_CONFIG.maxSize, {
    message: `File size must be less than ${Math.round(FILE_UPLOAD_CONFIG.maxSize / (1024 * 1024))}MB`,
  })
  .refine((file) => FILE_UPLOAD_CONFIG.allowedTypes.includes(file.type as any), {
    message: `File type must be one of: ${FILE_UPLOAD_CONFIG.allowedTypes.join(', ')}`,
  });

// File upload result type
export interface FileUploadResult {
  success: boolean;
  data?: {
    file_id: string;
    filename: string;
    file_type: string;
    file_size: number;
    url: string;
    created_at: string;
  };
  error?: string;
}

// File validation result
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate a file before upload
 */
export const validateFile = (file: File): FileValidationResult => {
  try {
    fileSchema.parse(file);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.errors[0]?.message || 'File validation failed',
      };
    }
    return {
      isValid: false,
      error: 'Unknown validation error',
    };
  }
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice(filename.lastIndexOf('.'));
};

/**
 * Check if file type is image
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * Create preview URL for image file
 */
export const createImagePreview = (file: File): string => {
  if (!isImageFile(file)) {
    throw new Error('File is not an image');
  }
  return URL.createObjectURL(file);
};

/**
 * Cleanup preview URL
 */
export const cleanupImagePreview = (url: string): void => {
  URL.revokeObjectURL(url);
};

/**
 * Create FormData for file upload
 */
export const createFileFormData = (file: File, caption?: string): FormData => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (caption) {
    formData.append('caption', caption);
  }
  
  return formData;
};

/**
 * Handle file input change event
 */
export const handleFileInputChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  onFileSelect: (file: File) => void,
  onError: (error: string) => void
): void => {
  const file = event.target.files?.[0];
  
  if (!file) {
    return;
  }
  
  const validation = validateFile(file);
  
  if (!validation.isValid) {
    onError(validation.error || 'File validation failed');
    // Reset input
    event.target.value = '';
    return;
  }
  
  onFileSelect(file);
};

/**
 * Handle drag and drop file
 */
export const handleFileDrop = (
  event: React.DragEvent<HTMLElement>,
  onFileSelect: (file: File) => void,
  onError: (error: string) => void
): void => {
  event.preventDefault();
  
  const files = Array.from(event.dataTransfer.files);
  const file = files[0];
  
  if (!file) {
    onError('No file selected');
    return;
  }
  
  if (files.length > 1) {
    onError('Please select only one file');
    return;
  }
  
  const validation = validateFile(file);
  
  if (!validation.isValid) {
    onError(validation.error || 'File validation failed');
    return;
  }
  
  onFileSelect(file);
};

/**
 * Handle drag over event
 */
export const handleDragOver = (event: React.DragEvent<HTMLElement>): void => {
  event.preventDefault();
};

/**
 * Generate unique filename
 */
export const generateUniqueFilename = (originalFilename: string): string => {
  const timestamp = Date.now();
  const extension = getFileExtension(originalFilename);
  const nameWithoutExt = originalFilename.replace(extension, '');
  
  return `${nameWithoutExt}_${timestamp}${extension}`;
};

// Export types
export type FileUploadConfig = typeof FILE_UPLOAD_CONFIG;
