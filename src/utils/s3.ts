import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const REGION = process.env.LINODE_REGION;
const ENDPOINT = process.env.LINODE_ENDPOINT;
const ACCESS_KEY = process.env.LINODE_ACCESS_KEY;
const SECRET_KEY = process.env.LINODE_SECRET_KEY;
const BUCKET = process.env.LINODE_BUCKET;

// Initialize S3 client for Linode Object Storage (S3 compatible)
export const s3Client = new S3Client({
  region: REGION,
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_KEY ?? '',
    secretAccessKey: SECRET_KEY ?? '',
  },
  forcePathStyle: true,
});

/**
 * Standard list of supported file types:
 * Images: jpg, jpeg, png, gif, webp
 * Documents: pdf, doc, docx
 * Audio: mpeg, mp3, wav, ogg, x-m4a, webm, aac, flac
 * Video: mp4, quicktime, webm, ogg, x-matroska
 */
export const ALLOWED_FILE_TYPES = [
  'image/svg+xml',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Audio
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/x-m4a',
  'audio/webm',
  'audio/aac',
  'audio/flac',
  // Video
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/ogg',
  'video/x-matroska',
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // Default 5MB for standard uploads
export const MAX_MEDIA_SIZE = 100 * 1024 * 1024; // 100MB for Audio/Video

/**
 * Helper to build the nested storage key based on current date:
 * Format: 2026/May/20-05-2026/[timestamp]-[sanitized-filename]
 */
export function generateDateBasedKey(fileName: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const monthName = now.toLocaleString('default', { month: 'long' }); // e.g. "May"
  const day = String(now.getDate()).padStart(2, '0');
  const monthNumeric = String(now.getMonth() + 1).padStart(2, '0');
  const timestamp = Date.now();
  
  // Clean filename of unwanted characters
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  return `${year}/${monthName}/${day}-${monthNumeric}-${year}/${timestamp}-${sanitizedName}`;
}

interface UploadOptions {
  allowedTypes?: string[];
  maxSize?: number;
}

/**
 * Validates and uploads a file to Linode Object Storage
 * @param fileBuffer Buffer representation of the file
 * @param fileName Original file name
 * @param mimeType MIME type of the file
 * @param options Custom validation options for file type and size
 * @returns Public URL of the uploaded file
 */
export async function uploadToS3(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  options?: UploadOptions
): Promise<string> {
  const allowedTypes = options?.allowedTypes ?? ALLOWED_FILE_TYPES;
  const maxSize = options?.maxSize ?? MAX_FILE_SIZE;

  // 1. Validation - File Type
  if (!allowedTypes.includes(mimeType)) {
    throw new Error(`Unsupported file type: ${mimeType}.`);
  }

  // 2. Validation - File Size
  if (fileBuffer.length > maxSize) {
    const sizeInMB = (maxSize / (1024 * 1024)).toFixed(0);
    throw new Error(`File too large. Maximum allowed size is ${sizeInMB}MB.`);
  }

  const key = generateDateBasedKey(fileName);

  // 3. Upload to Linode
  const uploadCommand = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
    ACL: 'public-read',
  });

  await s3Client.send(uploadCommand);

  // 4. Return Public URL
  return `${ENDPOINT}/${BUCKET}/${key}`;
}

/**
 * Deletes a file from Linode Object Storage given its public URL or key
 * @param urlOrKey The full public URL or the S3 key of the object
 */
export async function deleteFromS3(urlOrKey: string): Promise<void> {
  if (!urlOrKey) return;

  let key = urlOrKey;

  // Extract key if a full URL was provided
  if (urlOrKey.startsWith('http://') || urlOrKey.startsWith('https://')) {
    const urlPattern = `${ENDPOINT}/${BUCKET}/`;
    if (urlOrKey.startsWith(urlPattern)) {
      key = urlOrKey.substring(urlPattern.length);
    } else {
      // In case path-style or virtual-host style varies
      const parts = urlOrKey.split(`/${BUCKET}/`);
      if (parts.length > 1) {
        key = parts[1];
      }
    }
  }

  const deleteCommand = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  try {
    await s3Client.send(deleteCommand);
  } catch (error) {
    console.error(`Failed to delete key ${key} from S3:`, error);
  }
}

/**
 * Generates a temporary pre-signed URL for secure access to a private object
 * @param key The S3 key of the private object
 * @param expiresInSeconds Duration in seconds for the link validity (default 1 hour)
 */
export async function getPresignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
  const getCommand = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  
  return await getSignedUrl(s3Client, getCommand, { expiresIn: expiresInSeconds });
}

/**
 * Helper to upload a base64 encoded string to S3, returns public URL.
 * If the string is already a URL (e.g. starts with http), returns it as-is.
 */
export async function uploadBase64ToS3(
  base64Str: string | null | undefined,
  fallbackName: string
): Promise<string | null> {
  if (!base64Str) return null;
  
  const match = base64Str.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    // If it's already an HTTP/HTTPS URL, just return it.
    return base64Str;
  }

  const mimeType = match[1];
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, 'base64');

  // Determine standard file extension from mimeType
  let extension = 'bin';
  if (mimeType === 'image/svg+xml') {
    extension = 'svg';
  } else if (mimeType.startsWith('image/')) {
    extension = mimeType.split('/')[1] || 'png';
  } else if (mimeType.startsWith('audio/')) {
    extension = mimeType.split('/')[1] || 'mp3';
    if (extension === 'mpeg') extension = 'mp3';
  } else if (mimeType.startsWith('video/')) {
    extension = mimeType.split('/')[1] || 'mp4';
  } else if (mimeType === 'application/pdf') {
    extension = 'pdf';
  }

  const fileName = `${fallbackName}.${extension}`;

  // Allow larger files for audio/video
  const isLargeMedia = mimeType.startsWith('audio/') || mimeType.startsWith('video/');
  const maxSize = isLargeMedia ? MAX_MEDIA_SIZE : MAX_FILE_SIZE;

  return await uploadToS3(buffer, fileName, mimeType, {
    allowedTypes: ALLOWED_FILE_TYPES,
    maxSize,
  });
}
