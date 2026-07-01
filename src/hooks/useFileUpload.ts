import { useState, useCallback } from 'react'
import { uploadFile, uploadFiles, type S3Folder, type UploadResult } from '@/lib/s3'

// ─── Single file upload ───────────────────────────────────────────────────────

interface SingleUploadState {
  uploading: boolean
  progress: number        // 0–100
  result: UploadResult | null
  error: string | null
}

/**
 * Hook for uploading a single file to a specific S3 folder.
 *
 * @example
 * const { upload, uploading, progress, result, error } = useFileUpload('avatars')
 * const url = await upload(file)
 */
export function useFileUpload(folder: S3Folder) {
  const [state, setState] = useState<SingleUploadState>({
    uploading: false,
    progress: 0,
    result: null,
    error: null,
  })

  const upload = useCallback(
    async (file: File): Promise<string | null> => {
      setState({ uploading: true, progress: 0, result: null, error: null })

      try {
        const result = await uploadFile(folder, file, (pct) => {
          setState((s) => ({ ...s, progress: pct }))
        })
        setState({ uploading: false, progress: 100, result, error: null })
        return result.publicUrl
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        setState({ uploading: false, progress: 0, result: null, error: message })
        return null
      }
    },
    [folder],
  )

  const reset = useCallback(() => {
    setState({ uploading: false, progress: 0, result: null, error: null })
  }, [])

  return { upload, reset, ...state }
}

// ─── Multi-file upload ────────────────────────────────────────────────────────

interface MultiUploadState {
  uploading: boolean
  done: number            // files completed so far
  total: number           // total files in current batch
  results: UploadResult[]
  error: string | null
}

/**
 * Hook for uploading multiple files to a specific S3 folder.
 *
 * @example
 * const { uploadMany, uploading, done, total, results } = useMultiFileUpload('mandate-images')
 * const urls = await uploadMany(files)
 */
export function useMultiFileUpload(folder: S3Folder) {
  const [state, setState] = useState<MultiUploadState>({
    uploading: false,
    done: 0,
    total: 0,
    results: [],
    error: null,
  })

  const uploadMany = useCallback(
    async (files: File[]): Promise<UploadResult[]> => {
      if (!files.length) return []

      setState({ uploading: true, done: 0, total: files.length, results: [], error: null })

      try {
        const results = await uploadFiles(folder, files, (done, total) => {
          setState((s) => ({ ...s, done, total }))
        })
        setState({ uploading: false, done: files.length, total: files.length, results, error: null })
        return results
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        setState((s) => ({ ...s, uploading: false, error: message }))
        return []
      }
    },
    [folder],
  )

  const reset = useCallback(() => {
    setState({ uploading: false, done: 0, total: 0, results: [], error: null })
  }, [])

  return { uploadMany, reset, ...state }
}
