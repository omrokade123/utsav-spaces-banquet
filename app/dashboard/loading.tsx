export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-52 animate-pulse rounded-lg bg-[#e7dfd2]" />
      <div className="h-6 w-72 animate-pulse rounded-lg bg-[#e7dfd2]" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl border border-[#ded7cc] bg-[#f5f0e8]"
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="h-[340px] animate-pulse rounded-2xl border border-[#ded7cc] bg-[#f5f0e8]" />
        <div className="h-[340px] animate-pulse rounded-2xl border border-[#ded7cc] bg-[#f5f0e8]" />
      </div>
    </div>
  );
}
