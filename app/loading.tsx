export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-9 bg-ink/10" />
      <div className="h-16 bg-ink" />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="h-10 w-64 bg-mist rounded" />
        <div className="mt-5 flex gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-8 w-24 bg-mist rounded-full" />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index}>
              <div className="aspect-square bg-mist rounded-lg" />
              <div className="mt-3 h-3 w-20 bg-mist rounded" />
              <div className="mt-2 h-5 w-3/4 bg-mist rounded" />
              <div className="mt-2 h-5 w-1/3 bg-mist rounded" />
              <div className="mt-3 h-10 w-full bg-mist rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
