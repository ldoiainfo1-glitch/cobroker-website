import { supabase } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

export type S3Folder =
  | 'mandate-images'
  | 'mandate-documents'
  | 'avatars'
  | 'kyc-documents'
  | 'company-logos'
  | 'company-covers'
  | 'deal-documents'

interface PresignedUrlResponse {
  presignedUrl: string
  publicUrl: string
  s3Key: string
}

export interface UploadResult {
  publicUrl: string
  s3Key: string
}

// ─── Core helpers ─────────────────────────────────────────────────────────────

/**
 * Ask the Edge Function for a presigned S3 PUT URL.
 * AWS credentials never leave the server.
 */
async function getPresignedUrl(
  folder: S3Folder,
  filename: string,
  contentType: string,
): Promise<PresignedUrlResponse> {
  const { data, error } = await supabase.functions.invoke<PresignedUrlResponse>(
    'get-upload-url',
    { body: { folder, filename, contentType } },
  )

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to get upload URL from server')
  }

  return data
}

/**
 * Upload a single File to S3 via presigned URL.
 *
 * @param folder  - S3 folder (e.g. 'mandate-images')
 * @param file    - Browser File object
 * @param onProgress - optional 0–100 progress callback
 * @returns publicUrl and s3Key of the uploaded file
 */
export async function uploadFile(
  folder: S3Folder,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<UploadResult> {
  onProgress?.(10)

  const { presignedUrl, publicUrl, s3Key } = await getPresignedUrl(
    folder,
    file.name,
    file.type,
  )

  onProgress?.(40)

  const res = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  })

  if (!res.ok) {
    throw new Error(`S3 upload failed (${res.status}): ${res.statusText}`)
  }

  onProgress?.(100)

  return { publicUrl, s3Key }
}

/**
 * Upload multiple files to the same S3 folder, sequentially.
 * Returns an array of results in the same order as the input files.
 */
export async function uploadFiles(
  folder: S3Folder,
  files: File[],
  onProgress?: (done: number, total: number) => void,
): Promise<UploadResult[]> {
  const results: UploadResult[] = []

  for (let i = 0; i < files.length; i++) {
    const result = await uploadFile(folder, files[i])
    results.push(result)
    onProgress?.(i + 1, files.length)
  }

  return results
}

// ─── Convenience wrappers ─────────────────────────────────────────────────────

export const uploadAvatar = (file: File) => uploadFile('avatars', file)
export const uploadCompanyLogo = (file: File) => uploadFile('company-logos', file)
export const uploadCompanyCover = (file: File) => uploadFile('company-covers', file)
export const uploadMandateImage = (file: File, onProgress?: (pct: number) => void) =>
  uploadFile('mandate-images', file, onProgress)
export const uploadMandateDocument = (file: File) => uploadFile('mandate-documents', file)
export const uploadKycDocument = (file: File) => uploadFile('kyc-documents', file)
export const uploadDealDocument = (file: File) => uploadFile('deal-documents', file)
