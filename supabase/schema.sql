-- =============================================================================
-- TOKI CLOUD DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Includes Row Level Security (RLS), Triggers, Cascades, and Query Indexes
-- =============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. PROFILES TABLE (Linked to auth.users)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  timezone text default 'UTC',
  theme_preference text default 'system' check (theme_preference in ('system', 'light', 'dark')),
  default_priority text default 'Medium' check (default_priority in ('Low', 'Medium', 'High')),
  default_category text default 'Personal',
  notifications_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Trigger to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if already exists then recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 2. TASKS TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null check (trim(title) <> ''),
  description text default '',
  status text default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text default 'Medium' check (priority in ('Low', 'Medium', 'High')),
  category text default 'Personal',
  due_date date,
  completed boolean default false,
  completed_at timestamptz,
  focus_sessions integer default 0 check (focus_sessions >= 0),
  focus_minutes integer default 0 check (focus_minutes >= 0),
  position integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.tasks enable row level security;

create policy "Users can view own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can create own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- Indexes for tasks query patterns
create index if not exists idx_tasks_user_id on public.tasks (user_id);
create index if not exists idx_tasks_user_due_date on public.tasks (user_id, due_date);
create index if not exists idx_tasks_user_status on public.tasks (user_id, status);
create index if not exists idx_tasks_user_completed on public.tasks (user_id, completed);

-- -----------------------------------------------------------------------------
-- 3. TASK SUBTASKS TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.task_subtasks (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  title text not null check (trim(title) <> ''),
  completed boolean default false,
  position integer default 0,
  created_at timestamptz default now()
);

alter table public.task_subtasks enable row level security;

create policy "Users can view own subtasks"
  on public.task_subtasks for select
  using (auth.uid() = user_id);

create policy "Users can create own subtasks"
  on public.task_subtasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own subtasks"
  on public.task_subtasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own subtasks"
  on public.task_subtasks for delete
  using (auth.uid() = user_id);

create index if not exists idx_subtasks_task_id on public.task_subtasks (task_id);
create index if not exists idx_subtasks_user_id on public.task_subtasks (user_id);

-- -----------------------------------------------------------------------------
-- 4. TAGS TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.tags (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  created_at timestamptz default now(),
  unique (user_id, name)
);

alter table public.tags enable row level security;

create policy "Users can view own tags"
  on public.tags for select
  using (auth.uid() = user_id);

create policy "Users can create own tags"
  on public.tags for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own tags"
  on public.tags for delete
  using (auth.uid() = user_id);

create index if not exists idx_tags_user_id on public.tags (user_id);

-- -----------------------------------------------------------------------------
-- 5. TASK TAGS JUNCTION TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.task_tags (
  task_id uuid references public.tasks on delete cascade not null,
  tag_id uuid references public.tags on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  primary key (task_id, tag_id)
);

alter table public.task_tags enable row level security;

create policy "Users can view own task_tags"
  on public.task_tags for select
  using (auth.uid() = user_id);

create policy "Users can create own task_tags"
  on public.task_tags for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own task_tags"
  on public.task_tags for delete
  using (auth.uid() = user_id);

create index if not exists idx_task_tags_user_id on public.task_tags (user_id);
create index if not exists idx_task_tags_task_id on public.task_tags (task_id);

-- -----------------------------------------------------------------------------
-- 6. FOCUS SESSIONS TABLE (POMODORO)
-- -----------------------------------------------------------------------------
create table if not exists public.focus_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  task_id uuid references public.tasks on delete set null,
  mode text default 'focus' check (mode in ('focus', 'break')),
  duration_minutes integer not null default 25,
  created_at timestamptz default now()
);

alter table public.focus_sessions enable row level security;

create policy "Users can view own focus sessions"
  on public.focus_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own focus sessions"
  on public.focus_sessions for insert
  with check (auth.uid() = user_id);

create index if not exists idx_focus_user_id on public.focus_sessions (user_id);
create index if not exists idx_focus_created_at on public.focus_sessions (created_at desc);

-- -----------------------------------------------------------------------------
-- 7. USER ACHIEVEMENTS TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.user_achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  achievement_id text not null,
  unlocked_at timestamptz default now(),
  unique (user_id, achievement_id)
);

alter table public.user_achievements enable row level security;

create policy "Users can view own achievements"
  on public.user_achievements for select
  using (auth.uid() = user_id);

create policy "Users can unlock own achievements"
  on public.user_achievements for insert
  with check (auth.uid() = user_id);

create index if not exists idx_achievements_user_id on public.user_achievements (user_id);

-- -----------------------------------------------------------------------------
-- 8. REALTIME REPLICATION ENABLEMENT
-- -----------------------------------------------------------------------------
-- Enable publication for realtime subscription
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.task_subtasks;
