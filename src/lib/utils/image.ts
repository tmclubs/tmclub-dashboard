import { env } from '../config/env';

/**
 * Generates an absolute URL for a backend image resource.
 * If the provided URL is already absolute (starts with http), it returns it as is.
 * Otherwise, it prepends the backend API URL.
 *
 * @param relativeUrl - The relative path to the image (e.g., '/media/member/avatars/image.png')
 * @returns The absolute URL or undefined if the input is undefined
 */
export const getBackendImageUrl = (relativeUrl: string | undefined | null): string | undefined => {
  if (!relativeUrl) return undefined;

  // If it's already an absolute URL, return it
  if (relativeUrl.startsWith('http') || relativeUrl.startsWith('blob:') || relativeUrl.startsWith('data:')) {
    return relativeUrl;
  }

  // Remove leading slash from path and trailing slash from baseUrl to ensure exactly one slash
  const baseUrl = env.apiUrl.endsWith('/') ? env.apiUrl.slice(0, -1) : env.apiUrl;
  const path = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;

  return `${baseUrl}${path}`;
};
