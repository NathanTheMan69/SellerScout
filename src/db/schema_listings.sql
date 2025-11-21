create table saved_listings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  listing_title text not null,
  listing_url text,
  price numeric,
  image_url text,
  total_sales numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table saved_listings enable row level security;

-- Create Policy: Users can only view their own saved listings
create policy "Users can view their own saved listings"
  on saved_listings for select
  using (auth.uid() = user_id);

-- Create Policy: Users can insert their own saved listings
create policy "Users can insert their own saved listings"
  on saved_listings for insert
  with check (auth.uid() = user_id);

-- Create Policy: Users can delete their own saved listings
create policy "Users can delete their own saved listings"
  on saved_listings for delete
  using (auth.uid() = user_id);
