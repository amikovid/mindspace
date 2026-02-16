# Supabase Setup Guide

## Quick 5-Minute Setup

### 1. Create Supabase Account (1 min)
- Go to https://supabase.com
- Sign up with GitHub (easiest)
- Create a new project
- Choose a database password (save it somewhere)

### 2. Create the Database Table (2 min)
- In your project dashboard, go to SQL Editor
- Click 'New Query'
- Paste this SQL and click RUN:

```sql
create table wisdom_submissions (
  id uuid default gen_random_uuid() primary key,
  age integer not null,
  gender text not null,
  occupation text not null,
  wisdom text not null,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table wisdom_submissions enable row level security;

-- Allow anyone to insert (submit wisdom)
create policy "Anyone can submit wisdom"
  on wisdom_submissions for insert
  with check (true);

-- Allow anyone to read pending submissions (for admin page)
create policy "Anyone can view submissions"
  on wisdom_submissions for select
  using (true);

-- Allow anyone to update (for approve/reject)
create policy "Anyone can update submissions"
  on wisdom_submissions for update
  using (true);
```

### 3. Get Your API Keys (1 min)
- Go to Settings > API
- Copy the Project URL
- Copy the anon/public key

### 4. Add to Your Project (1 min)
- Create a file called `.env` in your project root
- Add these lines (replace with your actual values):

```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 5. Restart Dev Server
- Stop the current dev server (Ctrl+C)
- Run `npm run dev` again

## Done! 🎉

- Visit http://localhost:5173/contribute to test submissions
- Visit http://localhost:5173/admin to review submissions
- Click 'Approve & Download' to get JSON files for approved wisdom

## Note
The .env file is gitignored by default, so your keys won't be committed.

