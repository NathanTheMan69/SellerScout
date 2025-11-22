-- Create trends table
CREATE TABLE IF NOT EXISTS trends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    keyword TEXT NOT NULL,
    search_volume INTEGER,
    competition TEXT,
    growth INTEGER,
    monthly_searches JSONB, -- Array of 12 months data points
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE trends ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow read access to all authenticated users
CREATE POLICY "Allow read access for authenticated users" ON trends
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow insert/update/delete only for service role (or specific admin users if needed)
-- For now, we'll assume data is managed via admin scripts or direct DB access
-- so we won't add explicit policies for modification by regular users.
