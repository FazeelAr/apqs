-- =============================================================================
-- ALL PAKISTAN QUIZ SOCIETY (APQS) — DATABASE SCHEMA
-- Run this in the Supabase SQL Editor
-- =============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null default '',
  email text not null default '',
  avatar_url text default '',
  phone text default '',
  city text default '',
  university text default '',
  bio text default '',
  role text not null check (role in ('member', 'president', 'super_admin')) default 'member',
  is_cabinet boolean not null default false,
  cabinet_position text default null,
  cabinet_order integer default 999,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) for Profiles
alter table public.profiles enable row level security;

-- Everyone can read profiles
create policy "Public profiles are viewable by everyone" 
  on public.profiles for select 
  using (true);

-- Users can update their own profile (cannot escalate their own role)
create policy "Users can update their own basic profile" 
  on public.profiles for update 
  using (auth.uid() = id)
  with check (
    auth.uid() = id
  );

-- Admins (president & super_admin) can update any profile (roles, cabinet status)
create policy "Admins can update any profile" 
  on public.profiles for update 
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('president', 'super_admin')
    )
  );

-- -----------------------------------------------------------------------------
-- 2. TRIGGER: Auto-create profile on signup (Google OAuth)
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  is_first_user boolean;
begin
  -- Check if this is the very first user; if so, make them super_admin
  select count(*) = 0 into is_first_user from public.profiles;

  insert into public.profiles (
    id,
    full_name,
    email,
    avatar_url,
    role
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    case when is_first_user then 'super_admin' else 'member' end
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = case when public.profiles.full_name = '' then excluded.full_name else public.profiles.full_name end,
    avatar_url = case when public.profiles.avatar_url = '' or public.profiles.avatar_url is null then excluded.avatar_url else public.profiles.avatar_url end,
    updated_at = timezone('utc'::text, now());

  return new;
end;
$$;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 3. EVENTS TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  created_by uuid references public.profiles(id) on delete set null,
  title text not null,
  slug text unique,
  description text not null,
  image_url text default '',
  registration_link text default '',
  booklet_pdf_url text default '',
  event_date date not null,
  event_time text not null default '10:00 AM',
  venue text not null default 'Online / To be announced',
  status text not null check (status in ('pending', 'approved', 'rejected', 'concluded')) default 'pending',
  rejection_reason text default null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Events
alter table public.events enable row level security;

-- Approved or concluded events are viewable by everyone
create policy "Approved or concluded events are viewable by everyone"
  on public.events for select
  using (
    status in ('approved', 'concluded')
    or auth.uid() = created_by
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('president', 'super_admin')
    )
  );

-- Authenticated users can create events (starts as 'pending')
create policy "Authenticated users can create pending events"
  on public.events for insert
  with check (
    auth.role() = 'authenticated'
    and created_by = auth.uid()
    and status = 'pending'
  );

-- Event creators can update their pending events
create policy "Creators can update pending events"
  on public.events for update
  using (
    auth.uid() = created_by and status = 'pending'
  );

-- Admins can update any event (approve, reject, conclude, edit)
create policy "Admins can update any event"
  on public.events for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('president', 'super_admin')
    )
  );

-- Admins can delete events
create policy "Admins can delete events"
  on public.events for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('president', 'super_admin')
    )
  );

-- -----------------------------------------------------------------------------
-- 4. EVENT RESULTS & WINNERS
-- -----------------------------------------------------------------------------
create table if not exists public.event_results (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade unique not null,
  winner_id uuid references public.profiles(id) on delete restrict not null,
  runner_up_id uuid references public.profiles(id) on delete restrict,
  second_runner_up_id uuid references public.profiles(id) on delete restrict,
  year integer not null,
  notes text default '',
  declared_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Event Results
alter table public.event_results enable row level security;

-- Everyone can view results
create policy "Results are viewable by everyone"
  on public.event_results for select
  using (true);

-- Admins can insert/update results
create policy "Admins can insert results"
  on public.event_results for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('president', 'super_admin')
    )
  );

create policy "Admins can update results"
  on public.event_results for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('president', 'super_admin')
    )
  );

-- -----------------------------------------------------------------------------
-- 5. LEADERBOARD (Aggregated Standings)
-- -----------------------------------------------------------------------------
create table if not exists public.leaderboard (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  year integer not null, -- e.g. 2026, or 0 for All-Time
  wins integer default 0 not null,
  runner_ups integer default 0 not null,
  total_points integer default 0 not null, -- Win = 10 pts, Runner-up = 5 pts
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, year)
);

-- RLS for Leaderboard
alter table public.leaderboard enable row level security;

create policy "Leaderboard is viewable by everyone"
  on public.leaderboard for select
  using (true);

-- -----------------------------------------------------------------------------
-- 6. RECALCULATE LEADERBOARD FUNCTION
-- -----------------------------------------------------------------------------
create or replace function public.recalculate_leaderboard()
returns trigger
language plpgsql
security definer
as $$
declare
  res record;
  target_year integer;
begin
  target_year := coalesce(new.year, old.year);

  -- 1. Refresh year-specific entries
  delete from public.leaderboard where year = target_year;

  insert into public.leaderboard (user_id, year, wins, runner_ups, total_points, updated_at)
  select 
    p.id as user_id,
    target_year as year,
    coalesce(w.win_count, 0) as wins,
    coalesce(r.runner_count, 0) as runner_ups,
    (coalesce(w.win_count, 0) * 10) + (coalesce(r.runner_count, 0) * 5) as total_points,
    now()
  from public.profiles p
  left join (
    select winner_id, count(*) as win_count 
    from public.event_results 
    where year = target_year 
    group by winner_id
  ) w on w.winner_id = p.id
  left join (
    select runner_up_id, count(*) as runner_count 
    from public.event_results 
    where year = target_year and runner_up_id is not null
    group by runner_up_id
  ) r on r.runner_up_id = p.id
  where coalesce(w.win_count, 0) > 0 or coalesce(r.runner_count, 0) > 0;

  -- 2. Refresh All-Time (year = 0)
  delete from public.leaderboard where year = 0;

  insert into public.leaderboard (user_id, year, wins, runner_ups, total_points, updated_at)
  select 
    p.id as user_id,
    0 as year,
    coalesce(w.win_count, 0) as wins,
    coalesce(r.runner_count, 0) as runner_ups,
    (coalesce(w.win_count, 0) * 10) + (coalesce(r.runner_count, 0) * 5) as total_points,
    now()
  from public.profiles p
  left join (
    select winner_id, count(*) as win_count 
    from public.event_results 
    group by winner_id
  ) w on w.winner_id = p.id
  left join (
    select runner_up_id, count(*) as runner_count 
    from public.event_results 
    where runner_up_id is not null
    group by runner_up_id
  ) r on r.runner_up_id = p.id
  where coalesce(w.win_count, 0) > 0 or coalesce(r.runner_count, 0) > 0;

  return null;
end;
$$;

drop trigger if exists on_event_result_changed on public.event_results;
create trigger on_event_result_changed
  after insert or update or delete on public.event_results
  for each row execute function public.recalculate_leaderboard();
