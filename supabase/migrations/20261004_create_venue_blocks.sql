create table if not exists public.venue_blocks (
  id uuid primary key default gen_random_uuid(),
  event_date date not null,
  shift text not null,
  reason text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  constraint venue_blocks_shift_check
    check (shift in ('morning', 'evening', 'full_day'))
);

create unique index if not exists venue_blocks_event_date_shift_unique
  on public.venue_blocks (event_date, shift);

alter table public.venue_blocks enable row level security;

create policy "Owners and admins can manage venue blocks"
  on public.venue_blocks
  for all
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('owner', 'admin')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('owner', 'admin')
    )
  );

create policy "Customers cannot read venue blocks"
  on public.venue_blocks
  for select
  using (false);
