import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { LoginForm, LoginHero } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your Octopus account',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left panel — hidden on mobile */}
      <div className="bg-surface-page hidden w-full flex-col px-6 py-8 lg:flex lg:w-[57.29%] lg:px-10 lg:py-10">
        {/* Logo */}
        <div className="mb-8 lg:mb-0">
          <Link href="/products">
            <Image
              src="/assets/logos/logo-full.svg"
              alt="Octopus Logo"
              width={160}
              height={40}
              priority
              className="cursor-pointer"
            />
          </Link>
        </div>

        {/* Hero content */}
        <div className="flex flex-1 items-center justify-center">
          <LoginHero />
        </div>
      </div>

      {/* Right panel */}
      <div className="flex w-full flex-col items-center justify-center bg-white px-6 py-10 lg:w-[42.71%] lg:px-0">
        <div className="flex w-full max-w-108 flex-col items-center gap-8">
          {/* Mobile-only logo */}
          <div className="block lg:hidden">
            <Link href="/products">
              <Image
                src="/assets/logos/logo-full.svg"
                alt="Octopus Logo"
                width={160}
                height={40}
                priority
              />
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-ink text-2xl leading-9.75 font-bold md:text-[32px]">
              Welcome Octopus!
            </h2>
            <p className="text-ink-subtle text-sm leading-4.25">
              Manage your smart signage, watch your company grow.
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
