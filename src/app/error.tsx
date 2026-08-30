"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="state-panel border-red-200 bg-red-50" role="alert">
      <h1 className="text-2xl font-bold text-red-950">Something went wrong</h1>
      <p className="mt-2 text-sm leading-6 text-red-800">
        This page could not be loaded. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 rounded-lg bg-red-900 px-4 py-2 text-sm font-bold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-900"
      >
        Try again
      </button>
    </div>
  );
}
