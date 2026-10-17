/**
 * Server-side File Upload Validation (BE-04)
 * Enforces byte limits (5MB for covers, 40MB for PDFs) and verifies magic byte headers
 * to prevent disguised executables or storage exhaustion.
 */

export const MAX_COVER_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_PDF_FILE_SIZE = 40 * 1024 * 1024; // 40 MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates cover image file size and verifies PNG magic bytes: \x89PNG\r\n\x1a\n
 */
export async function validateCoverImageFile(
  file: File | null | undefined
): Promise<FileValidationResult> {
  if (!file || file.size === 0) {
    return { valid: false, error: "Cover image is required." };
  }

  if (file.size > MAX_COVER_IMAGE_SIZE) {
    return { valid: false, error: "Cover image exceeds maximum allowed size of 5MB." };
  }

  if (!file.name.toLowerCase().endsWith(".png")) {
    return { valid: false, error: "Cover image must have a .png extension." };
  }

  try {
    const headerBuffer = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    const isPng =
      headerBuffer[0] === 0x89 &&
      headerBuffer[1] === 0x50 &&
      headerBuffer[2] === 0x4e &&
      headerBuffer[3] === 0x47 &&
      headerBuffer[4] === 0x0d &&
      headerBuffer[5] === 0x0a &&
      headerBuffer[6] === 0x1a &&
      headerBuffer[7] === 0x0a;

    if (!isPng) {
      return { valid: false, error: "Invalid PNG file content (magic bytes mismatch)." };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: "Unable to verify cover image file content." };
  }
}

/**
 * Validates PDF file size and verifies PDF magic bytes: %PDF- (\x25\x50\x44\x46\x2D)
 */
export async function validatePdfDocumentFile(
  file: File | null | undefined
): Promise<FileValidationResult> {
  if (!file || file.size === 0) {
    return { valid: false, error: "PDF file is required." };
  }

  if (file.size > MAX_PDF_FILE_SIZE) {
    return { valid: false, error: "PDF document exceeds maximum allowed size of 40MB." };
  }

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return { valid: false, error: "File must have a .pdf extension." };
  }

  try {
    const headerBuffer = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    // PDF signature: %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
    const isPdf =
      headerBuffer[0] === 0x25 &&
      headerBuffer[1] === 0x50 &&
      headerBuffer[2] === 0x44 &&
      headerBuffer[3] === 0x46 &&
      headerBuffer[4] === 0x2d;

    if (!isPdf) {
      return { valid: false, error: "Invalid PDF document content (magic bytes mismatch)." };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: "Unable to verify PDF file content." };
  }
}
