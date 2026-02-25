'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { clearError, login } from '../store/authSlice';
import PasswordInput from './PasswordInput';

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const validate = () => {
    const errors: { username?: string; password?: string } = {};
    if (!username.trim()) errors.username = 'Username is required.';
    if (!password) errors.password = 'Password is required.';
    return errors;
  };

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    dispatch(clearError());

    const result = await dispatch(login({ username, password }));

    if (login.fulfilled.match(result)) {
      router.push('/products');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-108 flex-col gap-4"
    >
      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Username field */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="username"
          className="text-ink text-sm leading-5 font-medium"
        >
          Username<span className="text-red-500">*</span>
        </label>
        <input
          id="username"
          name="username"
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (fieldErrors.username)
              setFieldErrors((prev) => ({ ...prev, username: undefined }));
          }}
          placeholder="Enter your username"
          disabled={isLoading}
          className={`bg-surface-input text-ink placeholder-ink-subtle focus:border-primary h-11 w-full rounded-lg px-4 py-3 text-sm leading-5 font-normal outline-none focus:border ${
            fieldErrors.username ? 'border border-red-500' : ''
          }`}
        />
        {fieldErrors.username && (
          <p className="text-xs text-red-500">{fieldErrors.username}</p>
        )}
      </div>

      {/* Password field */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-ink text-sm leading-5 font-medium"
        >
          Password<span className="text-red-500">*</span>
        </label>
        <PasswordInput
          id="password"
          name="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password)
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
          }}
          placeholder="Enter your password"
          disabled={isLoading}
          hasError={!!fieldErrors.password}
        />
        {fieldErrors.password && (
          <p className="text-xs text-red-500">{fieldErrors.password}</p>
        )}
      </div>

      {/* Remember me */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          role="checkbox"
          aria-checked={rememberMe}
          onClick={() => setRememberMe(!rememberMe)}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
            rememberMe
              ? 'border-primary bg-primary'
              : 'border-border-default bg-white'
          }`}
        >
          {rememberMe && (
            <Image
              src="/assets/icons/check.svg"
              alt="Check Icon"
              width={12}
              height={12}
            />
          )}
        </button>
        <span className="text-ink text-sm leading-3.5">Remember me?</span>
      </div>

      {/* Login button */}
      <Button type="submit" isLoading={isLoading} fullWidth>
        Login
      </Button>
    </form>
  );
}
