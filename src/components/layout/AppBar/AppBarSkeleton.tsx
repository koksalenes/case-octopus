export function AppBarSkeleton() {
  return (
    <header className="border-border-light sticky top-0 z-50 w-full border-b bg-white">
      <div className="mx-auto flex h-14 max-w-360 items-center justify-between px-4 md:h-23 md:px-8">
        {/* Logo skeleton */}
        <div className="bg-surface-input h-9 w-28 animate-pulse rounded md:size-8.5" />

        {/* Right section skeleton */}
        <div className="flex items-center gap-4">
          {/* Icon skeletons */}
          <div className="hidden items-center gap-4 md:flex">
            <div className="bg-surface-input size-6 animate-pulse rounded-full" />
            <div className="bg-surface-input size-6 animate-pulse rounded-full" />
            <div className="bg-surface-input size-6 animate-pulse rounded-full" />
          </div>

          {/* Avatar skeleton */}
          <div className="flex items-center gap-2">
            <div className="bg-surface-input size-11 animate-pulse rounded-full" />
            <div className="hidden md:block">
              <div className="bg-surface-input h-5 w-20 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
