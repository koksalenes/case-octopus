'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

import { cn } from '@/lib/utils';

import { Spinner } from './Spinner';

const buttonVariants = cva(
  // shape, typography, behaviour – never changes
  'inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-medium leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70',
  {
    variants: {
      /* Controls background / text / border color */
      variant: {
        primary:
          'bg-primary text-white hover:bg-primary-hover focus-visible:ring-primary',
        secondary:
          'bg-ink text-white hover:bg-ink-hover focus-visible:ring-ink',
      },
      /* Controls height */
      size: {
        sm: 'h-9 px-4 text-xs',
        md: 'h-11',
        lg: 'h-12 px-8 text-base',
      },
      /* Stretches the button to fill its container */
      fullWidth: {
        true: 'w-full',
      },
    },
    /* Default variants */
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  ),
);

Button.displayName = 'Button';

export { Button, buttonVariants };
