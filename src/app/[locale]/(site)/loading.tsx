/** Stream the route immediately while its public content is being resolved. */
export default function Loading() {
  return <div className="mx-auto min-h-dvh max-w-6xl px-5 pb-16 pt-36" aria-busy="true">
    <div className="h-3 w-24 rounded bg-primary/15" />
    <div className="mt-7 h-10 w-3/4 max-w-xl rounded bg-foreground/5" />
    <div className="mt-4 h-4 w-2/3 max-w-md rounded bg-foreground/5" />
    <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((item) => <div key={item} className="h-64 rounded-2xl border border-border bg-surface/40" />)}
    </div>
  </div>;
}
