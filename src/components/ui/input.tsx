import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/** Map input type → correct mobile keyboard */
const INPUT_MODE: Partial<Record<string, InputHTMLAttributes<HTMLInputElement>['inputMode']>> = {
  number:   'decimal',
  email:    'email',
  tel:      'tel',
  url:      'url',
  search:   'search',
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, inputMode, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      inputMode={inputMode ?? (type ? INPUT_MODE[type] : undefined)}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        // let date/time/color inputs keep their native chrome
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
