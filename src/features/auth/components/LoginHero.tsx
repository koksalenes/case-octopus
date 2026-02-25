import Image from 'next/image';

export default function LoginHero() {
  return (
    <div className="flex flex-col items-center gap-8 px-6 lg:px-10">
      {/* Illustration */}
      <div className="relative h-70 w-full max-w-125 md:h-85">
        <Image
          src="/assets/illustrations/login-hero.svg"
          alt="Creative team illustration"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Text content */}
      <div className="flex max-w-186.25 flex-col gap-2">
        <h1 className="text-ink text-2xl leading-9.75 font-bold md:text-[32px]">
          Let Free Your Creativity with Our Intuitive Content Creator
        </h1>
        <p className="text-ink-muted text-sm leading-4.75 font-normal md:text-base">
          No design degree is required! Effortlessly craft and design stunning
          and captivating content using our user-friendly creative editor. With
          our drag-and-drop technology, anyone can create amazing marketing
          materials in.
        </p>
      </div>
    </div>
  );
}
