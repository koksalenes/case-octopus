'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui';
import { credentialStorage } from '@/lib/credentialStorage';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { clearError, login } from '../store/authSlice';
import { PasswordInput } from './PasswordInput';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [rememberMe, setRememberMe] = useState(() => !!credentialStorage.get());

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: credentialStorage.get()?.username ?? '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    dispatch(clearError());

    const result = await dispatch(login(data));

    if (login.fulfilled.match(result)) {
      if (rememberMe) {
        credentialStorage.save(data.username.trim());
      } else {
        credentialStorage.clear();
      }
      router.push('/products');
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full max-w-108 flex-col gap-4"
    >
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label
          htmlFor="username"
          className="text-ink text-sm leading-5 font-medium"
        >
          Username<span className="text-red-500">*</span>
        </label>
        <input
          id="username"
          type="text"
          {...register('username')}
          placeholder="Enter your username"
          disabled={isLoading}
          className={`bg-surface-input text-ink placeholder-ink-subtle focus:border-primary h-11 w-full rounded-lg px-4 py-3 text-sm leading-5 font-normal outline-none focus:border ${
            errors.username ? 'border border-red-500' : ''
          }`}
        />
        {errors.username && (
          <p id="username-error" className="text-xs text-red-500">
            {errors.username.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-ink text-sm leading-5 font-medium"
        >
          Password<span className="text-red-500">*</span>
        </label>
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <PasswordInput
              id="password"
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              ariaLabel="Enter Your Password"
              placeholder="Enter your password"
              disabled={isLoading}
              hasError={!!errors.password}
            />
          )}
        />
        {errors.password && (
          <p id="password-error" className="text-xs text-red-500">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          role="checkbox"
          aria-label="Remember me"
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

      <Button type="submit" isLoading={isLoading} fullWidth>
        Login
      </Button>
    </form>
  );
}
