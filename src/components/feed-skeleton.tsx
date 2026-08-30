export function FeedSkeleton() {
  return (
    <div className="grid gap-4" aria-label="Loading articles" aria-busy="true">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
        >
          <div className="h-3 w-40 rounded bg-slate-200" />
          <div className="mt-5 h-6 w-full rounded bg-slate-200" />
          <div className="mt-2 h-6 w-3/4 rounded bg-slate-200" />
          <div className="mt-5 h-6 w-24 rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
