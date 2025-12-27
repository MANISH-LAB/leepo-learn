-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES: Manage roles, subscription status, and expiry
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  role text check (role in ('admin', 'student')) default 'student',
  subscription_status text check (subscription_status in ('active', 'inactive')) default 'inactive',
  subscription_expiry timestamptz,
  created_at timestamptz default now()
);

-- 2. HIERARCHY_NODES: Structure (Degree -> Year -> Subject -> Chapter -> Topic)
create table public.hierarchy_nodes (
  id uuid default uuid_generate_v4() primary key,
  parent_id uuid references public.hierarchy_nodes(id),
  type text check (type in ('DEGREE', 'YEAR', 'SUBJECT', 'CHAPTER', 'TOPIC')) not null,
  title text not null,
  order_index integer default 0,
  created_at timestamptz default now()
);

-- 3. CONTENT_ASSETS: The Files (Video, PDF) linked to Topic Nodes
create table public.content_assets (
  node_id uuid references public.hierarchy_nodes(id) primary key,
  video_url text,
  thumbnail_url text,
  pdf_url text,
  is_premium boolean default false
);

-- 4. USER_PROGRESS: Notes & Completion Ticks
create table public.user_progress (
  user_id uuid references public.profiles(id) not null,
  node_id uuid references public.hierarchy_nodes(id) not null,
  is_completed boolean default false,
  private_notes text,
  updated_at timestamptz default now(),
  primary key (user_id, node_id)
);

-- 5. PAYMENTS: Transaction Log
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  amount decimal(10, 2) not null,
  currency text default 'INR',
  status text check (status in ('success', 'failed', 'pending')) not null,
  transaction_id text, -- Razorpay ID
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.hierarchy_nodes enable row level security;
alter table public.content_assets enable row level security;
alter table public.user_progress enable row level security;
alter table public.payments enable row level security;

-- Policies (Simplified for initial setup)
-- Profiles: Users can read their own profile. Admins can read all.
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Admins can view all profiles" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Hierarchy & Content: Publicly readable (or restricted based on subscription if needed)
create policy "Public view hierarchy" on hierarchy_nodes for select using (true);
create policy "Public view content assets" on content_assets for select using (true);

-- Progress: Users can manage their own progress
create policy "Users manage own progress" on user_progress for all using (auth.uid() = user_id);

-- Payments: Users view own, Admins view all
create policy "Users view own payments" on payments for select using (auth.uid() = user_id);
create policy "Admins view all payments" on payments for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
