# Keeping Track

*by Third Act Exchange*

A shared record for families coordinating an ageing parent's care — every call, email, and visit with My Aged Care and other providers, in one running timeline visible to everyone in the family who needs it.

## Stack

- **Frontend:** React + TypeScript + Vite, Tailwind CSS
- **Backend:** [Supabase](https://supabase.com) — Postgres, Auth (magic link), Row Level Security, Realtime
- **Hosting:** designed for Vercel or Netlify (static frontend + Supabase does the rest)

No custom server is needed — the browser talks to Supabase directly, protected by Postgres Row Level Security (see [Security model](#security-model) below).

## How access works

- Sign-in is **email magic link** — no passwords to manage or leak. This also means "who's logging this" is a real, persistent identity, not a typed name — important for a shared record family members may need to trust in a dispute.
- A family creates a log and gets a short **share code** (e.g. `ABC-123`) to hand out. The code only ever grants membership to an authenticated, signed-in person — it's never itself a bearer credential, and it's not part of any URL.
- Every family's entries are isolated from every other family's by Postgres Row Level Security — see below.

## Local setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com), create a free account/project if you don't have one.
2. In the new project, open **SQL Editor** → **New query**, paste in the contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates all tables, Row Level Security policies, and the `create_family` / `join_family` functions.
3. Open **Authentication → Sign In / Providers**, confirm **Email** is enabled (it is by default) and that **Confirm email** / magic link is on. Under **Authentication → URL Configuration**, set the **Site URL** to where the app will run (e.g. `http://localhost:5173` for now, your production URL later — you can list multiple as Redirect URLs).
4. Under **Project Settings → API**, copy the **Project URL** and the **anon public** key.

### 2. Configure the app

```bash
cp .env.example .env
```

Fill in `.env` with the URL and anon key from step 1.4.

### 3. Run it

```bash
npm install
npm run dev
```

## Deploying

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. Import it into [Vercel](https://vercel.com) (or Netlify). Framework preset: Vite.
3. Add the two environment variables from `.env` in the host's project settings.
4. Once deployed, go back to Supabase → **Authentication → URL Configuration** and add your production URL as a Redirect URL (and update Site URL if this is the primary place people will use it). Magic links won't correctly redirect back into the app until this is set.

## Security model

- **Row Level Security (RLS)** is enabled on every table. A signed-in user can only read or write rows belonging to a family they are a member of — enforced in Postgres itself, not just in application code, so there's no way to see another family's data by guessing an ID or calling the API directly.
- **Identity is not spoofable.** Database triggers set `logged_by` / `logged_by_name` (and `updated_by` / `updated_by_name` on edits) from the authenticated session server-side — a client cannot claim an entry was logged by someone else.
- **Family creation/joining** happens through Postgres functions (`create_family`, `join_family`) rather than direct table access, so a join code can only ever be used to add the *current authenticated user* as a member — it can't be used to read or enumerate family data on its own.
- **Transport:** Vercel/Netlify and Supabase both serve over HTTPS by default — no configuration needed there.
- **Passwords:** none exist to leak — magic-link auth means Supabase (a well-audited third party) handles credential storage entirely.

### Reasonable to accept for a prototype / early family use

- No rate limiting on the `join_family` share-code check beyond Supabase's platform defaults — a 6-character code (32^6 ≈ 1 billion combinations, excluding ambiguous characters) is not brute-forceable in practice at prototype scale, but isn't hardened against a sustained scripted attack.
- No audit log of *who viewed* the timeline, only who wrote to it.
- No account recovery flow beyond "request another magic link" (which is sufficient, since there's no password to reset).

### Worth doing before a wider/public launch

- Add a Postgres rate limit or CAPTCHA in front of `join_family` if the app grows beyond word-of-mouth family use.
- Add Supabase's leaked-password protection / stricter email verification settings if you ever add password-based sign-in.
- Review Supabase's default Postgres connection limits and enable Point-in-Time-Recovery backups (paid tier) once real family data is at stake — free-tier projects are backed up less frequently.
- Add a privacy policy / terms of use page, since this stores identifiable health-adjacent information about a third party (the parent) who isn't the one consenting.
- Consider a "leave family" / "remove member" flow — v1 has no way to revoke a member's access short of deleting them directly in the Supabase dashboard.

## Data model

```
families         (id, name, parent_name, join_code, created_by, created_at)
family_members   (id, family_id, user_id, display_name, joined_at)
entries          (id, family_id, entry_date, category, contact, notes,
                   reference_number, follow_up, follow_up_resolved,
                   logged_by, logged_by_name, updated_by, updated_by_name,
                   created_at, updated_at)
```

`family_members` is a join table between `auth.users` and `families`, so the schema already supports one person belonging to (or logging into) more than one family log — useful if the app ever needs to support multiple parents/cases per person. The v1 UI shows a lightweight switcher whenever someone belongs to more than one, but never requires it.

## v1 feature set

- Create or join a family log via share code
- Log an interaction (date, category, contact, notes, optional reference number, optional follow-up)
- Photo/document attachments per entry (see below)
- Timeline, newest first, filterable by category
- Open follow-ups surfaced in a banner until marked resolved
- Edit and delete entries
- Realtime — everyone's timeline updates live as entries are added

Out of scope for v1 (see project brief): notifications/reminders, multiple parents/cases in the UI, payments, My Aged Care integration.

## Attachments

Entries can have photos or PDFs attached (e.g. a photo of a letter, a screenshot of an email). Files live in a private Supabase Storage bucket, isolated per family the same way every other table is — a storage policy checks family membership against the `<family_id>/...` prefix of the file's path, so there's no way to access another family's files even with a direct link. Run [`supabase/migration_002_attachments.sql`](supabase/migration_002_attachments.sql) once (after `schema.sql`) to enable it — same process as the initial schema, paste into SQL Editor and run.

Limits: 10MB per file, images (jpeg/png/webp/heic) and PDFs only. Both are enforced at the Supabase Storage bucket level, not just in the app.
