'use client';

export default function ProductsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <h2 className="text-xl font-bold text-red-600">
        Failed to load products
      </h2>
      <p className="text-ink-muted">
        Something went wrong while fetching products. Please try again.
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  );
}
