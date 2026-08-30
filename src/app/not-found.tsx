import Link from "next/link";

export default function NotFound() {
  return (
    <div className="state-panel">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
        Page not found
      </h1>
      <p className="mt-3 text-slate-600">
        The article or source you requested could not be found.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-lg bg-teal-800 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
      >
        Return to latest news
      </Link>
    </div>
  );
}
