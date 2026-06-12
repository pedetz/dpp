begin;

select plan(8);

-- ------------------------------------------------------------
-- Setup
-- ------------------------------------------------------------

do $$
declare
  v_org_owner uuid := '70000000-0000-0000-0000-000000000001';
  v_org_editor uuid := '70000000-0000-0000-0000-000000000002';
  v_outsider   uuid := '70000000-0000-0000-0000-000000000003';
  v_org        uuid := '70000000-0000-0000-0000-000000000010';
begin
  insert into auth.users (id, email) values
    (v_org_owner,  'owner@invite-test.com'),
    (v_org_editor, 'editor@invite-test.com'),
    (v_outsider,   'outsider@invite-test.com');

  insert into organizations (id, name, plan) values
    (v_org, 'Invite Test Org', 'starter');

  insert into org_members (org_id, user_id, role) values
    (v_org, v_org_owner,  'owner'),
    (v_org, v_org_editor, 'editor');
end $$;

-- ------------------------------------------------------------
-- Test 1: org owner can create an invitation
-- ------------------------------------------------------------

set local role authenticator;
set local "request.jwt.claims" to '{"sub":"70000000-0000-0000-0000-000000000001","role":"authenticated"}';

select lives_ok(
  $$
    insert into invitations (id, org_id, email, role, token, invited_by)
    values (
      '80000000-0000-0000-0000-000000000001',
      '70000000-0000-0000-0000-000000000010',
      'newmember@example.com',
      'editor',
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      '70000000-0000-0000-0000-000000000001'
    )
  $$,
  'org owner should be able to create an invitation'
);

-- ------------------------------------------------------------
-- Test 2: org editor cannot create an invitation
-- ------------------------------------------------------------

set local "request.jwt.claims" to '{"sub":"70000000-0000-0000-0000-000000000002","role":"authenticated"}';

select throws_ok(
  $$
    insert into invitations (id, org_id, email, role, token, invited_by)
    values (
      '80000000-0000-0000-0000-000000000002',
      '70000000-0000-0000-0000-000000000010',
      'anothermember@example.com',
      'viewer',
      'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      '70000000-0000-0000-0000-000000000002'
    )
  $$,
  null,
  'org editor should NOT be able to create an invitation'
);

-- ------------------------------------------------------------
-- Test 3: outsider cannot create an invitation for the org
-- ------------------------------------------------------------

set local "request.jwt.claims" to '{"sub":"70000000-0000-0000-0000-000000000003","role":"authenticated"}';

select throws_ok(
  $$
    insert into invitations (id, org_id, email, role, token, invited_by)
    values (
      '80000000-0000-0000-0000-000000000003',
      '70000000-0000-0000-0000-000000000010',
      'hacker@example.com',
      'editor',
      'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
      '70000000-0000-0000-0000-000000000003'
    )
  $$,
  null,
  'outsider should NOT be able to create an invitation for another org'
);

-- ------------------------------------------------------------
-- Test 4: invitation row is visible to the inviting org member
-- ------------------------------------------------------------

set local "request.jwt.claims" to '{"sub":"70000000-0000-0000-0000-000000000001","role":"authenticated"}';

select is(
  (select count(*)::int from invitations
   where org_id = '70000000-0000-0000-0000-000000000010'),
  1,
  'org owner should see the invitation they created'
);

-- ------------------------------------------------------------
-- Test 5: expired invitation cannot be accepted
-- ------------------------------------------------------------

-- Insert an already-expired invitation directly as superuser (bypass RLS)
-- to simulate the expired-invite scenario.
reset role;

insert into invitations (id, org_id, email, role, token, invited_by, expires_at)
values (
  '80000000-0000-0000-0000-000000000004',
  '70000000-0000-0000-0000-000000000010',
  'outsider@invite-test.com',
  'viewer',
  'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
  '70000000-0000-0000-0000-000000000001',
  now() - interval '1 day'   -- already expired
);

set local role authenticator;
set local "request.jwt.claims" to '{"sub":"70000000-0000-0000-0000-000000000003","role":"authenticated"}';

select throws_ok(
  $$
    update invitations
    set accepted_at = now()
    where id = '80000000-0000-0000-0000-000000000004'
  $$,
  null,
  'expired invitation should not be acceptable'
);

-- ------------------------------------------------------------
-- Test 6: accepting a valid invitation sets accepted_at
-- ------------------------------------------------------------

reset role;

-- Insert a valid invitation for the outsider user
insert into invitations (id, org_id, email, role, token, invited_by)
values (
  '80000000-0000-0000-0000-000000000005',
  '70000000-0000-0000-0000-000000000010',
  'outsider@invite-test.com',
  'viewer',
  'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  '70000000-0000-0000-0000-000000000001'
);

set local role authenticator;
set local "request.jwt.claims" to '{"sub":"70000000-0000-0000-0000-000000000003","role":"authenticated"}';

select lives_ok(
  $$
    update invitations
    set accepted_at = now()
    where id = '80000000-0000-0000-0000-000000000005'
  $$,
  'invitee with matching email should be able to accept a valid invitation'
);

select isnt(
  (select accepted_at from invitations where id = '80000000-0000-0000-0000-000000000005'),
  null,
  'accepted_at should be set after acceptance'
);

-- ------------------------------------------------------------
-- Test 8: accepting invitation should allow inserting into org_members
-- (simulates the application-level post-accept step as superuser)
-- ------------------------------------------------------------

reset role;

select lives_ok(
  $$
    insert into org_members (org_id, user_id, role)
    values (
      '70000000-0000-0000-0000-000000000010',
      '70000000-0000-0000-0000-000000000003',
      'viewer'
    )
  $$,
  'accepted invitee can be added to org_members'
);

select is(
  (select role from org_members
   where org_id = '70000000-0000-0000-0000-000000000010'
     and user_id = '70000000-0000-0000-0000-000000000003'),
  'viewer',
  'new org member should have role viewer as specified in invitation'
);

select * from finish();
rollback;
