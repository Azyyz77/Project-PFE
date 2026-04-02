'use client';

/**
 * Loading Spinner - Shows async action in progress
 */

export function Spinner({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${className}`} />
  );
}

export function InlineSpinner() {
  return <Spinner className="inline-block h-4 w-4" />;
}
