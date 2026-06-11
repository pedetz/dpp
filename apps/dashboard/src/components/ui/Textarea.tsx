import { cn } from '@/lib/utils'
import type { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  rows?: number
}

export function Textarea({ label, error, rows = 3, className, id, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={cn(
          'rounded-md border px-3 py-2 text-sm shadow-sm transition-colors resize-y',
          'focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent',
          'placeholder:text-gray-400',
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300',
          'disabled:cursor-not-allowed disabled:bg-gray-50',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
