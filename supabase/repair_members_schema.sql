-- 1. Helper function to look up a user profile by email (Security Definer to read auth.users)
create or replace function public.get_user_by_email(email_to_find text)
returns jsonb
language plpgsql
security definer
set search_path = auth, public
as $$
declare
  found_user record;
begin
  select id, email, raw_user_meta_data
  into found_user
  from auth.users
  where email = email_to_find
  limit 1;

  if found_user.id is null then
    return null;
  end if;

  return jsonb_build_object(
    'id', found_user.id,
    'email', found_user.email,
    'name', coalesce(found_user.raw_user_meta_data->>'full_name', found_user.email)
  );
end;
$$;

grant execute on function public.get_user_by_email(text) to authenticated;

-- 2. Helper function to fetch all members (including emails/names) of a canvas
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
      'name', coalesce(u.raw_user_meta_data->>'full_name', u.email)
    )
  )
  into members_list
  from public.canvas_members cm
  join auth.users u on cm.user_id = u.id
  where cm.canvas_id = check_canvas_id;

  return coalesce(members_list, '[]'::jsonb);
end;
$$;

grant execute on function public.get_canvas_members(uuid) to authenticated;

-- 3. Update RLS policies for canvas_members
drop policy if exists "members_select_self" on public.canvas_members;
drop policy if exists "members_select_canvas" on public.canvas_members;
create policy "members_select_canvas"
on public.canvas_members for select
to authenticated
using (
  user_id = auth.uid()
  or public.canvas_member_role(canvas_id) is not null
);

drop policy if exists "members_insert_owner" on public.canvas_members;
create policy "members_insert_owner"
on public.canvas_members for insert
to authenticated
with check (
  public.canvas_member_role(canvas_id) = 'owner'
  or exists (
    select 1
    from public.canvases
    where id = canvas_id
      and owner_id = auth.uid()
  )
);
