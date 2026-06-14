create extension if not exists pgcrypto;

create table if not exists public.canvases (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Untitled Canvas',
  nodes jsonb not null default '[]'::jsonb,
  edges jsonb not null default '[]'::jsonb,
  versions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.canvases add column if not exists owner_id uuid references auth.users(id) on delete cascade;
alter table public.canvases add column if not exists name text not null default 'Untitled Canvas';
alter table public.canvases add column if not exists nodes jsonb not null default '[]'::jsonb;
alter table public.canvases add column if not exists edges jsonb not null default '[]'::jsonb;
alter table public.canvases add column if not exists versions jsonb not null default '[]'::jsonb;
alter table public.canvases add column if not exists created_at timestamptz not null default now();
alter table public.canvases add column if not exists updated_at timestamptz not null default now();

create table if not exists public.canvas_members (
  canvas_id uuid not null references public.canvases(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (canvas_id, user_id)
);

alter table public.canvas_members add column if not exists canvas_id uuid references public.canvases(id) on delete cascade;
alter table public.canvas_members add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.canvas_members add column if not exists role text not null default 'editor';
alter table public.canvas_members add column if not exists created_at timestamptz not null default now();

create table if not exists public.canvas_messages (
  id uuid primary key default gen_random_uuid(),
  canvas_id uuid not null references public.canvases(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_snapshot jsonb not null,
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.canvas_messages add column if not exists canvas_id uuid references public.canvases(id) on delete cascade;
alter table public.canvas_messages add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.canvas_messages add column if not exists user_snapshot jsonb not null default '{}'::jsonb;
alter table public.canvas_messages add column if not exists text text not null default '';
alter table public.canvas_messages add column if not exists created_at timestamptz not null default now();

alter table public.canvases enable row level security;
alter table public.canvas_members enable row level security;
alter table public.canvas_messages enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.canvases to authenticated;
grant select, insert, update, delete on public.canvas_members to authenticated;
grant select, insert on public.canvas_messages to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.canvas_role(check_canvas_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select cm.role
  from public.canvas_members cm
  where cm.canvas_id = check_canvas_id
    and cm.user_id = auth.uid()
  limit 1
$$;

create or replace function public.is_canvas_owner(check_canvas_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.canvases c
    where c.id = check_canvas_id
      and c.owner_id = auth.uid()
  )
$$;

drop trigger if exists canvases_set_updated_at on public.canvases;
create trigger canvases_set_updated_at
before update on public.canvases
for each row execute function public.set_updated_at();

drop policy if exists "canvas members can read canvases" on public.canvases;
create policy "canvas members can read canvases"
on public.canvases for select
to authenticated
using (public.canvas_role(id) in ('owner', 'editor', 'viewer'));

drop policy if exists "authenticated users can create canvases" on public.canvases;
create policy "authenticated users can create canvases"
on public.canvases for insert
to authenticated
with check (owner_id = (select auth.uid()));

drop policy if exists "owners and editors can update canvases" on public.canvases;
create policy "owners and editors can update canvases"
on public.canvases for update
to authenticated
using (public.canvas_role(id) in ('owner', 'editor'))
with check (public.canvas_role(id) in ('owner', 'editor'));

drop policy if exists "owners can delete canvases" on public.canvases;
create policy "owners can delete canvases"
on public.canvases for delete
to authenticated
using (owner_id = (select auth.uid()));

drop policy if exists "members can read memberships" on public.canvas_members;
create policy "members can read memberships"
on public.canvas_members for select
to authenticated
using (public.canvas_role(canvas_id) in ('owner', 'editor', 'viewer'));

drop policy if exists "owners can manage memberships" on public.canvas_members;
create policy "owners can manage memberships"
on public.canvas_members for all
to authenticated
using (public.canvas_role(canvas_id) = 'owner')
with check (public.canvas_role(canvas_id) = 'owner');

drop policy if exists "users can insert own owner membership" on public.canvas_members;
create policy "users can insert own owner membership"
on public.canvas_members for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and role = 'owner'
  and public.is_canvas_owner(canvas_id)
);

drop policy if exists "users can join shared canvases as editors" on public.canvas_members;
create policy "users can join shared canvases as editors"
on public.canvas_members for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and role = 'editor'
);

drop policy if exists "members can read messages" on public.canvas_messages;
create policy "members can read messages"
on public.canvas_messages for select
to authenticated
using (public.canvas_role(canvas_id) in ('owner', 'editor', 'viewer'));

drop policy if exists "members can send messages" on public.canvas_messages;
create policy "members can send messages"
on public.canvas_messages for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and public.canvas_role(canvas_id) in ('owner', 'editor')
);
