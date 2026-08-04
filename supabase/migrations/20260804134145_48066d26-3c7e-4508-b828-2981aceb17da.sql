create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create policy "Users can read their own roles"
on public.user_roles for select to authenticated
using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

insert into public.user_roles (user_id, role)
values ('3c7d6863-441a-48b4-9483-8d4d6537ad7a', 'admin')
on conflict do nothing;

alter table public.responses add column if not exists phone text;

drop policy if exists "Owners can create surveys" on public.surveys;
drop policy if exists "Owners can delete their surveys" on public.surveys;
drop policy if exists "Owners can update their surveys" on public.surveys;
drop policy if exists "Owners can view their surveys" on public.surveys;

create policy "Admin can create surveys"
on public.surveys for insert to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admin can update surveys"
on public.surveys for update to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admin can delete surveys"
on public.surveys for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admin can view all surveys"
on public.surveys for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Survey owners can read responses" on public.responses;
drop policy if exists "Survey owners can delete responses" on public.responses;

create policy "Admin can read responses"
on public.responses for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admin can delete responses"
on public.responses for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));