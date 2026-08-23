import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { focusRing, inputBase, labelBase } from "@/components/ui/styles";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export function Textarea({
  label,
  error,
  hint,
  id,
  className,
  ...props
}: TextareaProps) {
  const textareaId =
    id ?? (label ? label.replace(/\s+/g, "-").toLowerCase() : undefined);

  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={textareaId} className={labelBase}>
          {label}
        </label>
      ) : null}
      <textarea
        id={textareaId}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={
          error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined
        }
        className={cn(
          inputBase,
          focusRing,
          "min-h-[96px] resize-y",
          error && "border-red-300",
          className,
        )}
        {...props}
      />
      {hint && !error ? (
        <p id={`${textareaId}-hint`} className="text-xs text-zinc-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${textareaId}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
