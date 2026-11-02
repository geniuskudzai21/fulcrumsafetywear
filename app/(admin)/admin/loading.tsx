export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-52 rounded bg-white" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 rounded-xl bg-white" />
        ))}
      </div>
      <div className="h-72 rounded-xl bg-white" />
    </div>
  );
}
