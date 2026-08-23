"use client";

/**
 * Upload dropzone — CSV as text; Excel as binary base64 (never UTF-8-decoded).
 */

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import {
  detectUploadFileType,
  looksLikeBinaryMisdecodedAsText,
} from "../uploads/detect-file-type";

export type UploadDropzoneResult = {
  filename: string;
  mimeType: string;
  kind: "csv" | "xls" | "xlsx";
  /** Present for CSV / text tabular files. */
  text?: string;
  /** Present for Excel workbooks — base64 of original bytes. */
  binaryBase64?: string;
};

export type UploadDropzoneProps = {
  onFile: (result: UploadDropzoneResult) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  className?: string;
};

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function UploadDropzone({
  onFile,
  onError,
  disabled,
  className,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      try {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const kind = detectUploadFileType({
          fileName: file.name,
          mimeType: file.type,
          bytes,
        });

        if (kind === "unknown") {
          onError?.("ExecutiveOS could not identify this file format.");
          return;
        }

        if (kind === "csv") {
          const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
          if (looksLikeBinaryMisdecodedAsText(text)) {
            onError?.(
              "ExecutiveOS could not read this file as CSV. The contents look like a binary workbook — please upload .xls, .xlsx, or a true CSV export.",
            );
            return;
          }
          onFile({
            filename: file.name,
            mimeType: file.type || "text/csv",
            kind: "csv",
            text,
          });
          return;
        }

        // .xls / .xlsx — keep raw bytes; never file.text()
        const binaryBase64 = await fileToBase64(file);
        onFile({
          filename: file.name,
          mimeType:
            file.type ||
            (kind === "xls"
              ? "application/vnd.ms-excel"
              : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
          kind,
          binaryBase64,
        });
      } catch {
        onError?.(
          "ExecutiveOS could not read this Excel workbook. The file appears to be a legacy XLS workbook. Please verify the workbook or upload an XLSX/CSV version.",
        );
      }
    },
    [onError, onFile],
  );

  return (
    <div
      className={cn(
        "rounded-[var(--eos-radius-md)] border-2 border-dashed p-8 text-center transition-colors",
        dragging
          ? "border-[var(--exds-intelligence)] bg-[var(--exds-intelligence-soft)]"
          : "border-[var(--exds-card-border)] bg-[var(--exds-card-bg)]",
        disabled ? "opacity-50" : "cursor-pointer",
        className,
      )}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && !disabled) void handleFile(file);
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <p className="eos-type-subheading text-[var(--eos-color-text)]">
        Drop a CSV or Excel workbook
      </p>
      <p className="eos-type-caption mt-1">
        .csv · .xls · .xlsx — Excel is parsed structurally, never as plain text
      </p>
    </div>
  );
}
