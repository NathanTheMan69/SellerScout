-- Create the saved_keywords table
create table saved_keywords (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  keyword text not null,
  search_volume integer,
  competition text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table saved_keywords enable row level security;

-- Create policies
create policy "Users can view their own saved keywords"
  on saved_keywords for select
  using (auth.uid() = user_id);

create policy "Users can insert their own saved keywords"
  on saved_keywords for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own saved keywords"
  on saved_keywords for delete
  using (auth.uid() = user_id);
