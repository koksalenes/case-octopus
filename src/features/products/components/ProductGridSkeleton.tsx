export function ProductGridSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }, (_, i) => (
          <div
            key={i}
            className="mx-auto flex w-full max-w-77.75 flex-col gap-4"
          >
            <div className="h-44 animate-pulse rounded bg-gray-200" />
            <div className="flex flex-col gap-2">
              <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-1/2 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-1/4 animate-pulse rounded bg-gray-200" />
              <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, j) => (
                  <div
                    key={j}
                    className="h-4.5 w-5.25 animate-pulse rounded bg-gray-200"
                  />
                ))}
              </div>
            </div>
            <div className="h-11 animate-pulse rounded-lg bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
