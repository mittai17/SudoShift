-- Add recipient_id column to allow private direct messages between members
alter table public.canvas_messages 
add column if not exists recipient_id uuid references auth.users(id) on delete cascade;

-- Recreate the SELECT policy to allow reading public team messages AND private DMs for the current user
drop policy if exists "members can read messages" on public.canvas_messages;
create policy "members can read messages"
on public.canvas_messages for select
to authenticated
using (
  public.canvas_role(canvas_id) in ('owner', 'editor', 'viewer')
  and (
    recipient_id is null 
    or user_id = auth.uid() 
    or recipient_id = auth.uid()
  )
);
