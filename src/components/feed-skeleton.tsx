export function FeedSkeleton() {
  return (
    <div className="grid gap-4" aria-label="Loading articles" aria-busy="true">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-2xl border border-border bg-surface p-5 sm:p-6 flex flex-col sm:flex-row gap-4"
        >
          <div className="sm:w-[30%] shrink-0 aspect-16/10 rounded-xl bg-surface-muted" />
          <div className="grow space-y-3">
            <div className="h-3 w-36 rounded bg-surface-muted" />
            <div className="h-5 w-full rounded bg-surface-muted" />
            <div className="h-5 w-3/4 rounded bg-surface-muted" />
            <div className="h-4 w-5/6 rounded bg-surface-muted" />
            <div className="pt-2 flex items-center gap-2">
              <div className="h-6 w-20 rounded bg-surface-muted" />
              <div className="h-6 w-12 rounded bg-surface-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
