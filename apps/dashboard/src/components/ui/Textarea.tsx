import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className, id, rows = 4, ...rest },
  ref,
) {
  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      ) : null}
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        className={cn(
          "rounded-lg border-gray-300 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500",
          error && "border-red-400",
          className,
        )}
        {...rest}
      />
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
});
