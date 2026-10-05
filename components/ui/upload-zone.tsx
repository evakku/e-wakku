"use client";

import { useRef, useState, useCallback } from "react";
import { Image as ImageIcon, UploadCloud, FileText, X, Check, AlertCircle } from "lucide-react";

type Kind = "image" | "pdf";

interface UploadZoneProps {
  name: string; // must match the FormData field the server action reads
  label: string;
  kind: Kind;
  accept: string;
  acceptLabel: string;
  file: File | null;
  error?: string;
  onFile: (file: File | null, error: string | null) => void;
}

export function UploadZone({
  name,
  label,
  kind,
  accept,
  acceptLabel,
  file,
  error,
  onFile,
}: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSet = useCallback(
    (f: File | undefined, syncToInput = false) => {
      if (!f) return;
      const isValid = kind === "image" ? f.type === "image/png" : f.type === "application/pdf";
      if (!isValid) {
        onFile(null, `Only ${acceptLabel} files are supported.`);
        return;
      }

      // When the file comes from drag-and-drop, the real <input> never received
      // it — assign it manually via DataTransfer so it's included when the
      // parent <form> submits via the Server Action.
      if (syncToInput && inputRef.current) {
        const dt = new DataTransfer();
        dt.items.add(f);
        inputRef.current.files = dt.files;
      }

      onFile(f, null);
    },
    [kind, acceptLabel, onFile]
  );

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div>
      <label className="block p-2 text-md font-semibold">{label}<span className="text-red-500">*</span></label>

      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            validateAndSet(e.dataTransfer.files?.[0], true);
          }}
          className={`cursor-pointer rounded border-[1.5px] border-dashed p-8 text-center transition-all duration-250 ${
            error
              ? "border-error"
              : dragOver
              ? "border-accent bg-secondary-container"
              : "border-outline-variant bg-surface-low"
          }`}
        >
          {/* Real file input — kept in the DOM (not `hidden` attr) so it still submits with the form */}
          <input
            ref={inputRef}
            type="file"
            name={name}
            accept={accept}
            className="hidden"
            onChange={(e) => validateAndSet(e.target.files?.[0])}
          />
          <ImageIconOrUpload kind={kind} />
          <p className="text-sm font-medium">
            Drop file here or <span className="text-accent">browse</span>
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">{acceptLabel} only</p>
        </div>
      ) : (
        <div className="animate-fade-in flex items-center gap-3 rounded border border-surface-high bg-surface-lowest p-3">
          {/* Keep the input in the tree (with the file already attached) so it still submits */}
          <input ref={inputRef} type="file" name={name} accept={accept} className="hidden" />

          {kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={URL.createObjectURL(file)}
              alt="Cover preview"
              width={48}
              height={48}
              className="h-12 w-12 flex-shrink-0 rounded object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-surface-container">
              <FileText className="h-5 w-5 text-on-surface-variant" strokeWidth={1.6} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="flex items-center gap-1 text-xs text-on-surface-variant">
              <Check className="h-3 w-3 text-accent" />
              {formatSize(file.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onFile(null, null)}
            aria-label={`Remove ${label}`}
            className="rounded-full p-1.5 text-on-surface-variant transition-colors hover:bg-surface-low"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-error">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

function ImageIconOrUpload({ kind }: { kind: Kind }) {
  return kind === "image" ? (
    <ImageIcon className="mx-auto mb-2 h-5 w-5 text-outline" strokeWidth={1.5} />
  ) : (
    <UploadCloud className="mx-auto mb-2 h-5 w-5 text-outline" strokeWidth={1.5} />
  );
}