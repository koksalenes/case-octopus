'use client';

import Image from 'next/image';
import { useState } from 'react';

interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
}

export function PasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder = 'Enter your password',
  disabled = false,
  hasError = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`bg-surface-input text-ink placeholder-ink-subtle focus:border-primary h-11 w-full rounded-lg px-4 py-3 text-sm leading-5 font-normal outline-none focus:border ${hasError ? 'border border-red-500' : ''}`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="text-ink-subtle hover:text-ink-muted absolute top-1/2 right-4 -translate-y-1/2"
        tabIndex={-1}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? (
          <Image
            src="/assets/icons/eye.svg"
            alt="Hide password"
            width={20}
            height={20}
          />
        ) : (
          <Image
            src="/assets/icons/eye-slash.svg"
            alt="Show password"
            width={20}
            height={20}
          />
        )}
      </button>
    </div>
  );
}
