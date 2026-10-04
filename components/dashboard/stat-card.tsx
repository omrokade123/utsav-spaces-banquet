interface StatCardProps {
  title: string;
  value: string;
  detail: string;
}

export function StatCard({
  title,
  value,
  detail,
}: StatCardProps) {
  return (
    <article className="dashboard-stat-card rounded-2xl border border-[#ded7cc] bg-[#f9f6f1] p-5 shadow-sm">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8d7650]">
        {title}
      </p>
      <p className="mt-4 text-3xl font-medium tracking-tight text-[#171614]">
        {value}
      </p>
      <p className="mt-2 text-xs text-[#5f5853]">{detail}</p>
    </article>
  );
}
