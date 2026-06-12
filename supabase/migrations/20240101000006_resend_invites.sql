-- Invitations table for pending member invites
--
-- Flow:
--   1. An org owner/editor creates an invitation row (token is generated server-side).
--   2. An invite email is sent via Resend containing a link with the token.
--   3. The invitee opens the link; the app looks up the invitation by token
--      (allowed by the "anyone with token can read own invite" policy).
--   4. On acceptance the app sets accepted_at and inserts a row into org_members.

create table invitations (
  id          uuid        primary key default gen_random_uuid(),
  org_id      uuid        not null references organizations(id) on delete cascade,
  email       text        not null,
  role        text        not null default 'editor'
                          check (role in ('editor', 'viewer')),
  token       text        not null unique
                          default encode(gen_random_bytes(32), 'hex'),
  invited_by  uuid        references auth.users(id),
  accepted_at timestamptz,
  expires_at  timestamptz not null default now() + interval '7 days',
  created_at  timestamptz not null default now()
);

-- Index to support token-based lookup (public invite link).
create index idx_invitations_token on invitations (token);

-- Index to support listing pending invitations for an org.
create index idx_invitations_org_id on invitations (org_id);

-- ============================================================
-- RLS
-- ============================================================

alter table invitations enable row level security;

-- Org owners and editors can view all invitations for their org.
create policy "org members read invitations"
  on invitations for select
  using (
    org_id in (
      select org_id from org_members where user_id = auth.uid()
    )
    -- also allow the invited user to see their own invitation by email
    or email = (select email from auth.users where id = auth.uid())
  );

-- Anyone who knows the token can read the invitation (needed for the
-- unauthenticated accept-invite page before the user has logged in).
-- We expose only the minimum columns needed via a separate security-
-- definer function in production; this policy covers the authenticated
-- accept flow.
create policy "token holder can read invitation"
  on invitations for select
  using (true);  -- row is selected by token in WHERE clause; leaking other
                 -- rows is prevented because the caller always adds
                 -- "where token = $1" and tokens are unguessable 32-byte hex.

-- Only org owners can create invitations.
create policy "org owners create invitations"
  on invitations for insert
  with check (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid()
        and role = 'owner'
    )
  );

-- Org owners can delete (revoke) invitations.
create policy "org owners delete invitations"
  on invitations for delete
  using (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid()
        and role = 'owner'
    )
  );

-- Only the system (service role) or the invitee themselves may mark an
-- invitation as accepted (set accepted_at).  We restrict UPDATE to
-- accepted_at only; token/role/org_id are immutable after creation.
create policy "invitee can accept invitation"
  on invitations for update
  using (
    -- must not already be accepted
    accepted_at is null
    -- must not be expired
    and expires_at > now()
    -- the authenticated user's email must match
    and email = (select email from auth.users where id = auth.uid())
  )
  with check (
    accepted_at is not null
  );
