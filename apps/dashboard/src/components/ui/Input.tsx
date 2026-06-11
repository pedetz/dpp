import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, id, ...rest },
  ref,
) {
  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={id}
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
