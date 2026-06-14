-- 1. Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  avatar_color text,
  updated_at timestamptz not null default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- RLS policies for profiles:
-- Anyone can view profiles (needed for showing member lists, search, etc.)
drop policy if exists "anyone can read profiles" on public.profiles;
create policy "anyone can read profiles" on public.profiles
for select to authenticated using (true);

-- Users can update their own profile
drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile" on public.profiles
for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- 2. Create workspaces and folders tables first (without RLS policies yet)
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

-- 3. Update canvases table to link to workspaces and folders
alter table public.canvases add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.canvases add column if not exists folder_id uuid references public.folders(id) on delete set null;

-- 4. Now define RLS policies on workspaces and folders (referencing updated canvases columns)
alter table public.workspaces enable row level security;
alter table public.folders enable row level security;

-- RLS policies for workspaces:
-- Owners can do all operations
drop policy if exists "owners can manage own workspaces" on public.workspaces;
create policy "owners can manage own workspaces" on public.workspaces
for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Members can read workspaces if they belong to a canvas in it
drop policy if exists "users can read workspaces" on public.workspaces;
create policy "users can read workspaces" on public.workspaces
for select to authenticated
using (
  owner_id = auth.uid()
  or exists (
    select 1 from public.canvases c
    join public.canvas_members cm on c.id = cm.canvas_id
    where c.workspace_id = public.workspaces.id and cm.user_id = auth.uid()
  )
);

-- RLS policies for folders
drop policy if exists "users can manage folders" on public.folders;
create policy "users can manage folders" on public.folders
for all to authenticated
using (
  exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.owner_id = auth.uid()
  )
);

drop policy if exists "users can read folders" on public.folders;
create policy "users can read folders" on public.folders
for select to authenticated
using (
  exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and (
      w.owner_id = auth.uid()
      or exists (
        select 1 from public.canvases c
        join public.canvas_members cm on c.id = cm.canvas_id
        where c.workspace_id = w.id and cm.user_id = auth.uid()
      )
    )
  )
);

-- Enable select grants for authenticated users on workspaces and folders
grant select, insert, update, delete on public.workspaces to authenticated;
grant select, insert, update, delete on public.folders to authenticated;
grant select, insert, update on public.profiles to authenticated;

-- 5. Trigger for auto-profile creation on new user signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  default_username text;
begin
  default_username := coalesce(
    new.raw_user_meta_data->>'username', 
    split_part(new.email, '@', 1) || '_' || substring(new.id::text from 1 for 4)
  );
  
  -- Ensure username is unique in case of name clash
  if exists (select 1 from public.profiles where username = default_username) then
    default_username := default_username || '_' || substring(new.id::text from 5 for 4);
  end if;

  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    default_username,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  
  -- Create a default workspace for the new user too
  insert into public.workspaces (name, owner_id)
  values ('Personal Workspace', new.id);

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Populate profiles and default workspaces for existing users
do $$
declare
  user_rec record;
  default_workspace_id uuid;
  default_username text;
begin
  for user_rec in select id, email, raw_user_meta_data from auth.users loop
    -- Create profile if missing
    if not exists (select 1 from public.profiles where id = user_rec.id) then
      default_username := coalesce(
        user_rec.raw_user_meta_data->>'username', 
        split_part(user_rec.email, '@', 1) || '_' || substring(user_rec.id::text from 1 for 4)
      );
      if exists (select 1 from public.profiles where username = default_username) then
        default_username := default_username || '_' || substring(user_rec.id::text from 5 for 4);
      end if;
      
      insert into public.profiles (id, username, full_name)
      values (
        user_rec.id,
        default_username,
        coalesce(user_rec.raw_user_meta_data->>'full_name', user_rec.email)
      );
    end if;

    -- Create default workspace if missing
    if not exists (select 1 from public.workspaces where owner_id = user_rec.id) then
      insert into public.workspaces (name, owner_id)
      values ('Personal Workspace', user_rec.id)
      returning id into default_workspace_id;

      -- Assign existing canvases owned by this user to this default workspace
      update public.canvases
      set workspace_id = default_workspace_id
      where owner_id = user_rec.id and workspace_id is null;
    end if;
  end loop;
end;
$$;

-- 7. Update get_canvas_members RPC to fetch username
create or replace function public.get_canvas_members(check_canvas_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = auth, public
as $$
declare
  members_list jsonb;
begin
  -- Security check: check if caller is a member of the canvas
  if not exists (
    select 1
    from public.canvas_members
    where canvas_id = check_canvas_id
      and user_id = auth.uid()
  ) then
    return '[]'::jsonb;
  end if;

  select jsonb_agg(
    jsonb_build_object(
      'user_id', cm.user_id,
      'role', cm.role,
      'email', u.email,
      'name', coalesce(p.full_name, p.username, u.email),
      'username', p.username,
      'avatar_color', p.avatar_color
    )
  )
  into members_list
  from public.canvas_members cm
  join auth.users u on cm.user_id = u.id
  left join public.profiles p on cm.user_id = p.id
  where cm.canvas_id = check_canvas_id;

  return coalesce(members_list, '[]'::jsonb);
end;
$$;

-- 8. Update get_user_by_email RPC to fetch username
create or replace function public.get_user_by_email(email_to_find text)
returns jsonb
language plpgsql
security definer
set search_path = auth, public
as $$
declare
  found_user record;
begin
  select u.id, u.email, p.username, p.full_name
  into found_user
  from auth.users u
  left join public.profiles p on u.id = p.id
  where u.email = email_to_find
  limit 1;

  if found_user.id is null then
    return null;
  end if;

  return jsonb_build_object(
    'id', found_user.id,
    'email', found_user.email,
    'name', coalesce(found_user.full_name, found_user.username, found_user.email),
    'username', found_user.username
  );
end;
$$;
