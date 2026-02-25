import Image from 'next/image';
import Link from 'next/link';

/*
 * Full logo component: Octopus icon + brand text + subtext.
 */
export function Logo() {
  return (
    <Link
      href="/products"
      className="flex shrink-0 items-center gap-1.5 md:gap-2"
    >
      {/* Octopus icon */}
      <Image
        src="/assets/logos/logo.svg"
        alt="Logo"
        width={36}
        height={34}
        className="h-5 w-auto md:h-8.5"
        priority
      />

      {/* Text group */}
      <div className="flex flex-col gap-0.5">
        {/* Brand Text */}
        <Image
          src="/assets/logos/logo-text.svg"
          alt="Octopus Logo Text"
          width={130}
          height={19}
          priority
          className="h-3 w-auto md:h-4.75"
        />

        {/* Brand Subtext */}
        <Image
          src="/assets/logos/logo-subtext.svg"
          alt="Octopus Logo Subtext"
          width={127}
          height={11}
          priority
          className="h-1.5 w-auto md:h-2.75"
        />
      </div>
    </Link>
  );
}
