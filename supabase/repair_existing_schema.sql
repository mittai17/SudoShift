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

create table if not exists public.canvas_messages (
  id uuid primary key default gen_random_uuid(),
  canvas_id uuid not null references public.canvases(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_snapshot jsonb not null default '{}'::jsonb,
  text text not null default '',
  created_at timestamptz not null default now()
);

alter table public.canvases enable row level security;
alter table public.canvas_members enable row level security;
alter table public.canvas_messages enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.canvases to authenticated;
grant select, insert, update, delete on public.canvas_members to authenticated;
grant select, insert on public.canvas_messages to authenticated;

drop policy if exists "canvas members can read canvases" on public.canvases;
drop policy if exists "authenticated users can create canvases" on public.canvases;
drop policy if exists "owners and editors can update canvases" on public.canvases;
drop policy if exists "owners can delete canvases" on public.canvases;
drop policy if exists "members can read memberships" on public.canvas_members;
drop policy if exists "owners can manage memberships" on public.canvas_members;
drop policy if exists "users can insert own owner membership" on public.canvas_members;
drop policy if exists "users can join shared canvases as editors" on public.canvas_members;
drop policy if exists "members can read messages" on public.canvas_messages;
drop policy if exists "members can send messages" on public.canvas_messages;
drop policy if exists "canvases_select_own_or_member" on public.canvases;
drop policy if exists "canvases_insert_own" on public.canvases;
drop policy if exists "canvases_update_owner_or_editor" on public.canvases;
drop policy if exists "canvases_delete_owner" on public.canvases;
drop policy if exists "members_select_self" on public.canvas_members;
drop policy if exists "members_insert_self" on public.canvas_members;
drop policy if exists "members_update_owner" on public.canvas_members;
drop policy if exists "members_delete_owner" on public.canvas_members;
drop policy if exists "messages_select_member" on public.canvas_messages;
drop policy if exists "messages_insert_member" on public.canvas_messages;

drop function if exists public.canvas_role(uuid);
drop function if exists public.is_canvas_owner(uuid);

create or replace function public.canvas_member_role(check_canvas_id uuid)
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

revoke all on function public.canvas_member_role(uuid) from public;
grant execute on function public.canvas_member_role(uuid) to authenticated;

create policy "canvases_select_own_or_member"
on public.canvases for select
to authenticated
using (
  owner_id = (select auth.uid())
  or public.canvas_member_role(id) in ('owner', 'editor', 'viewer')
);

create policy "canvases_insert_own"
on public.canvases for insert
to authenticated
with check (owner_id = (select auth.uid()));

create policy "canvases_update_owner_or_editor"
on public.canvases for update
to authenticated
using (
  owner_id = (select auth.uid())
  or public.canvas_member_role(id) in ('owner', 'editor')
)
with check (
  owner_id = (select auth.uid())
  or public.canvas_member_role(id) in ('owner', 'editor')
);

create policy "canvases_delete_owner"
on public.canvases for delete
to authenticated
using (owner_id = (select auth.uid()));

create policy "members_select_self"
on public.canvas_members for select
to authenticated
using (user_id = (select auth.uid()));

create policy "members_insert_self"
on public.canvas_members for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and role in ('owner', 'editor')
);

create policy "members_update_owner"
on public.canvas_members for update
to authenticated
using (public.canvas_member_role(canvas_id) = 'owner')
with check (public.canvas_member_role(canvas_id) = 'owner');

create policy "members_delete_owner"
on public.canvas_members for delete
to authenticated
using (public.canvas_member_role(canvas_id) = 'owner');

create policy "messages_select_member"
on public.canvas_messages for select
to authenticated
using (public.canvas_member_role(canvas_id) in ('owner', 'editor', 'viewer'));

create policy "messages_insert_member"
on public.canvas_messages for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and public.canvas_member_role(canvas_id) in ('owner', 'editor')
);

notify pgrst, 'reload schema';
