# Database Migrations — Run manually in your Supabase SQL editor

This project uses **your own Supabase project** (BYO), so migrations aren't auto-applied.
Run each file in order in **Supabase → SQL Editor**. Each file is idempotent.

## Pending

- `20260710_tags_bestsellers.sql` — adds custom coloured Tags, bestseller ordering,
  and turns on realtime for the new tables. Required for **Custom Tags** and full
  **Best Selling** features to work end-to-end.

## How to run

1. Open your Supabase project dashboard.
2. Click **SQL Editor → New query**.
3. Paste the contents of the .sql file and click **Run**.
4. Reload the app — new features become active immediately.
