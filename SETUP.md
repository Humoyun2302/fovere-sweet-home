# Fovere Sweet Home — Supabase Setup

The app is now fully wired to Supabase: auth, leads CRUD, channels CRUD, and realtime updates.
Follow these one-time steps to get it running.

---

## 1. Run the database schema

1. Open your Supabase project → **SQL Editor** → **New query**.
2. Open `supabase/schema.sql` from this repo, copy the entire contents, paste, and click **Run**.
3. You should see "Success. No rows returned" and two seed channels created.

This creates:

- `public.profiles` (with role: `'admin' | 'user'`)
- `public.channels`
- `public.leads`
- A trigger that auto-creates a profile row on signup
- A helper `public.is_admin()` function
- RLS policies:
  - **Anyone** (incl. anonymous) can INSERT into `leads` — the public landing form
  - **Anyone** can SELECT `channels` — so the landing form can show channel banner
  - **Only admins** can SELECT/UPDATE/DELETE leads and write to channels
- Realtime publication for `leads` and `channels`

---

## 2. Create your admin user

1. Supabase Dashboard → **Authentication → Users → Add user → Create new user**
2. Enter email + password, tick **Auto Confirm User**, click **Create user**.
3. Go back to **SQL Editor** and promote that user to admin:

   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'your-email@example.com';
   ```

You can repeat this for any number of admins.

---

## 3. Add credentials to `.env.local`

Open `.env.local` (already created in the repo root, gitignored) and paste your project values
from **Supabase Dashboard → Settings → API**:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-public-key...
```

The `anon` key is safe to expose to the browser — Row Level Security protects your data.

---

## 4. Restart the dev server

```powershell
# in the project root
npm run dev
```

The Vite dev server reads `.env.local` only at startup, so you must restart after editing it.

Open [http://localhost:8080/login](http://localhost:8080/login), sign in with the admin you created, and you should land on `/admin` with live data.

---

## How it works

### Auth flow

- `src/lib/store.tsx` calls `supabase.auth.signInWithPassword` on login.
- After auth, it queries `public.profiles` and confirms `role = 'admin'`.
- If not admin, it signs the user out and shows "Sizda admin huquqi yo'q".
- `AdminGuard` in `src/routes/admin.tsx` redirects to `/login` if there's no admin session.

### Data flow

- On mount, the store loads `channels` (anonymous-allowed).
- When an admin logs in, it also loads `leads` and subscribes to realtime.
- All mutations call Supabase and don't touch local state directly — the realtime subscription
  echoes the change back and updates state, keeping it in sync across tabs and admins.

### Realtime channels

- `public:channels` — every client (incl. anonymous landing visitors) gets channel updates.
- `public:leads:<adminId>` — admins get insert/update/delete events for leads as they happen.

---

## Files added / changed for Supabase integration

```
supabase/schema.sql          ← run this in Supabase SQL Editor
.env.example                 ← template (committed)
.env.local                   ← your credentials (gitignored, fill it in)
src/lib/supabase.ts          ← client + row converters
src/lib/store-types.ts       ← extracted types (breaks circular import)
src/lib/store.tsx            ← refactored to async Supabase + realtime
src/routes/login.tsx         ← uses supabase.auth.signInWithPassword
src/routes/index.tsx         ← submit is now async
src/routes/admin.tsx         ← all mutations are async + loading states
```

---

## Troubleshooting

**"Supabase ulanmagan. .env.local faylini sozlang."**
You haven't filled in `.env.local` or you didn't restart `npm run dev` after editing it.

**Login succeeds but I get redirected to /login**
The user exists in Auth but their `profiles.role` is still `'user'`. Run the `update` SQL from step 2.

**Landing form submits but nothing appears in /admin**
1. Check Supabase Dashboard → **Authentication → Policies → leads** — the "anyone insert leads" policy must be enabled.
2. Make sure realtime is on: Dashboard → **Database → Replication** → `supabase_realtime` should list `leads` and `channels`. The schema runs `alter publication ... add table` to handle this automatically.

**Browser console: "Failed to subscribe channel"**
Realtime isn't enabled. Re-run the realtime section of `supabase/schema.sql`:

```sql
alter publication supabase_realtime add table public.leads;
alter publication supabase_realtime add table public.channels;
```

---

## Production deploy (Cloudflare Workers)

The project deploys to Cloudflare via `wrangler.jsonc`. For prod, set the env vars in
Cloudflare:

```powershell
npx wrangler secret put VITE_SUPABASE_URL
npx wrangler secret put VITE_SUPABASE_ANON_KEY
```

…or set them in the Cloudflare dashboard under **Workers → Settings → Variables**.
