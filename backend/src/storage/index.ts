import { mkdir, writeFile } from 'node:fs/promises'
import { resolve, join, extname } from 'node:path'
import { randomUUID } from 'node:crypto'
import { env } from '../config/env.js'

/* =========================================================================
   Media storage abstraction.

   Two drivers behind one interface so the rest of the app never cares where
   bytes live:
     - local: writes to STORAGE_LOCAL_DIR, served at STORAGE_PUBLIC_BASE_URL
     - s3:    Integration required. Credentials are read from env but the
              upload path intentionally throws until wired, rather than
              pretending to store the file.
   ========================================================================= */

export type StoredObject = { key: string; url: string; size: number; contentType: string }

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
])

export interface StorageDriver {
  readonly name: string
  put(file: { buffer: Buffer; originalName: string; contentType: string }): Promise<StoredObject>
}

function assertUploadAllowed(contentType: string, size: number) {
  if (!ALLOWED_MIME.has(contentType)) {
    throw new Error(`Unsupported media type: ${contentType}`)
  }
  const maxBytes = env.STORAGE_MAX_UPLOAD_MB * 1024 * 1024
  if (size > maxBytes) {
    throw new Error(`File exceeds max upload size of ${env.STORAGE_MAX_UPLOAD_MB}MB`)
  }
}

class LocalDriver implements StorageDriver {
  readonly name = 'local'
  async put(file: { buffer: Buffer; originalName: string; contentType: string }) {
    assertUploadAllowed(file.contentType, file.buffer.byteLength)
    const dir = resolve(env.STORAGE_LOCAL_DIR)
    await mkdir(dir, { recursive: true })
    const key = `${randomUUID()}${extname(file.originalName) || ''}`
    await writeFile(join(dir, key), file.buffer)
    return {
      key,
      url: `${env.STORAGE_PUBLIC_BASE_URL.replace(/\/$/, '')}/${key}`,
      size: file.buffer.byteLength,
      contentType: file.contentType,
    }
  }
}

class S3Driver implements StorageDriver {
  readonly name = 's3'
  async put(): Promise<StoredObject> {
    // Integration required: install and wire an S3 client (e.g. @aws-sdk/client-s3)
    // using S3_* env vars. Deliberately not faked.
    throw new Error(
      'S3 storage is configured but not connected (Integration required). ' +
        'Set STORAGE_DRIVER=local for now, or implement the S3 client in backend/src/storage/index.ts.',
    )
  }
}

export const storage: StorageDriver = env.STORAGE_DRIVER === 's3' ? new S3Driver() : new LocalDriver()

export { assertUploadAllowed }
