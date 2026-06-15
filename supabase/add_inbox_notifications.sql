-- Create inbox table
create table if not exists public.inbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('invite', 'mention', 'dm', 'other')),
  actor_id uuid references auth.users(id) on delete set null,
  actor_name text not null,
  canvas_id uuid references public.canvases(id) on delete cascade,
  canvas_name text,
  message_id uuid references public.canvas_messages(id) on delete cascade,
  content text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.inbox enable row level security;

-- Drop existing policies if any
drop policy if exists "users can read own notifications" on public.inbox;
drop policy if exists "authenticated users can insert notifications" on public.inbox;
drop policy if exists "users can update own notifications" on public.inbox;
drop policy if exists "users can delete own notifications" on public.inbox;

-- Create RLS policies
create policy "users can read own notifications"
on public.inbox for select
to authenticated
using (user_id = auth.uid());

create policy "authenticated users can insert notifications"
on public.inbox for insert
to authenticated
with check (true);

create policy "users can update own notifications"
on public.inbox for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "users can delete own notifications"
on public.inbox for delete
to authenticated
using (user_id = auth.uid());

-- Add the table to the supabase_realtime publication to enable real-time notifications
alter publication supabase_realtime add table public.inbox;

-- Grant table access
grant select, insert, update, delete on public.inbox to authenticated;
