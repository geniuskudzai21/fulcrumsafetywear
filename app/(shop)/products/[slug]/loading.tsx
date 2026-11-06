export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-9 bg-ink/10" />
      <div className="h-16 bg-ink" />
      <div className="max-w-7xl 2xl:max-w-[90rem] mx-auto px-4 py-8">
        <div className="h-4 w-56 bg-mist rounded" />
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <div className="aspect-square bg-mist rounded-lg" />
          <div>
            <div className="h-4 w-24 bg-mist rounded" />
            <div className="mt-3 h-10 w-3/4 bg-mist rounded" />
            <div className="mt-4 h-5 w-28 bg-mist rounded" />
            <div className="mt-4 h-4 w-full bg-mist rounded" />
            <div className="mt-2 h-4 w-5/6 bg-mist rounded" />
            <div className="mt-6 flex gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-7 w-7 bg-mist rounded-full"
                />
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-9 w-12 bg-mist rounded" />
              ))}
            </div>
            <div className="mt-6 h-12 w-full bg-mist rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
