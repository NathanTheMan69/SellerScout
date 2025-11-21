-- Create the saved_shops table
create table saved_shops (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  shop_name text not null,
  shop_url text,
  total_sales integer,
  listing_count integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

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
