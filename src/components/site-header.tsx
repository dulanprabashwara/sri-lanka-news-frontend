import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
          aria-label="Sri Lanka News home"
        >
          <span
            aria-hidden="true"
            className="grid size-10 place-items-center rounded-xl bg-teal-800 text-sm font-black tracking-tight text-white shadow-sm transition group-hover:bg-teal-700"
          >
            SL
          </span>
          <span className="leading-tight">
            <span className="block text-base font-bold tracking-tight text-slate-950">
              Sri Lanka News
            </span>
            <span className="block text-xs font-medium text-slate-500">
              Independent news index
            </span>
          </span>
        </Link>
        <nav aria-label="Primary navigation">
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Latest news
          </Link>
        </nav>
      </div>
    </header>
  );
}
