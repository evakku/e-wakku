/**
 * File Upload Validation (BE-04 / SEC-Upload)
 * Enforces strict 7.5 MiB limit per file and validates magic byte headers
 * to prevent disguised executables, corrupted files, and storage exhaustion.
 */

export const MAX_FILE_SIZE_BYTES = 7.5 * 1024 * 1024; // 7,864,320 bytes (7.5 MiB)
export const MAX_COVER_IMAGE_SIZE = MAX_FILE_SIZE_BYTES;
export const MAX_PDF_FILE_SIZE = MAX_FILE_SIZE_BYTES;

export const SUPPORTED_COVER_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"] as const;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  format?: "png" | "jpeg" | "webp" | "pdf";
}

/**
 * Formats byte size into human-readable representation.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Validates PNG signature: 89 50 4E 47 0D 0A 1A 0A
 */
export function isPngHeader(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  );
}

/**
 * Validates JPEG signature: FF D8 FF
 */
export function isJpegHeader(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  );
}

/**
 * Validates WebP signature: RIFF (bytes 0-3) and WEBP (bytes 8-11)
 */
export function isWebpHeader(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  );
}

/**
 * Validates PDF signature: %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
 */
export function isPdfHeader(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  );
}

/**
 * Inspects binary buffer to determine image format or invalidity.
 */
export function detectCoverImageFormat(bytes: Uint8Array): "png" | "jpeg" | "webp" | null {
  if (isPngHeader(bytes)) return "png";
  if (isJpegHeader(bytes)) return "jpeg";
  if (isWebpHeader(bytes)) return "webp";
  return null;
}

/**
 * Validates cover image file size (<= 7.5 MiB), extension, and magic bytes.
 * Supported formats: PNG, JPEG, WebP.
 */
export async function validateCoverImageFile(
  file: File | Blob | null | undefined
): Promise<FileValidationResult> {
  if (!file) {
    return { valid: false, error: "Cover image is required." };
  }

  if (file.size === 0) {
    return { valid: false, error: "The selected file is empty." };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: "The maximum file size is 7.5 MiB per file (exceeds maximum allowed size).",
    };
  }

  const fileName = (file as File).name?.toLowerCase() ?? "";
  if (fileName) {
    const hasValidExt = SUPPORTED_COVER_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext)
    );
    if (!hasValidExt) {
      return {
        valid: false,
        error: "Please select a supported cover image format (.png, .jpg, .jpeg, .webp).",
      };
    }
  }

  try {
    const headerBuffer = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    const detectedFormat = detectCoverImageFormat(headerBuffer);

    if (!detectedFormat) {
      return {
        valid: false,
        error: "Please select a supported cover image format (magic bytes mismatch).",
      };
    }

    return { valid: true, format: detectedFormat };
  } catch {
    return { valid: false, error: "Unable to verify cover image file content." };
  }
}

/**
 * Validates PDF document file size (<= 7.5 MiB), extension, and %PDF- magic bytes.
 */
export async function validatePdfDocumentFile(
  file: File | Blob | null | undefined
): Promise<FileValidationResult> {
  if (!file) {
    return { valid: false, error: "The issue PDF is required." };
  }

  if (file.size === 0) {
    return { valid: false, error: "The selected file is empty." };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: "The maximum file size is 7.5 MiB per file (exceeds maximum allowed size).",
    };
  }

  const fileName = (file as File).name?.toLowerCase() ?? "";
  if (fileName && !fileName.endsWith(".pdf")) {
    return { valid: false, error: "File must have a .pdf extension." };
  }

  try {
    const headerBuffer = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    if (!isPdfHeader(headerBuffer)) {
      return {
        valid: false,
        error: "Please select a valid PDF file (magic bytes mismatch).",
      };
    }

    return { valid: true, format: "pdf" };
  } catch {
    return { valid: false, error: "Unable to verify PDF file content." };
  }
}
