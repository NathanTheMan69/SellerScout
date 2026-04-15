-- Create the saved_shops table
create table saved_shops (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  shop_name text not null,
  shop_url text,
  total_sales integer,
  listing_count integer,
  revenue text,
  conv_rate text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Migration: add revenue and conv_rate columns if they don't exist
-- alter table saved_shops add column if not exists revenue text;
-- alter table saved_shops add column if not exists conv_rate text;

-- Enable Row Level Security (RLS)
alter table saved_shops enable row level security;

-- Create policies
create policy "Users can view their own saved shops"
  on saved_shops for select
  using (auth.uid() = user_id);

create policy "Users can insert their own saved shops"
  on saved_shops for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own saved shops"
  on saved_shops for delete
  using (auth.uid() = user_id);
