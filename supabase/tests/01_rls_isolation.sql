begin;

select plan(4);

do $$
declare
  v_org_a uuid := '10000000-0000-0000-0000-000000000001';
  v_org_b uuid := '10000000-0000-0000-0000-000000000002';
  v_user_a uuid := '20000000-0000-0000-0000-000000000001';
  v_user_b uuid := '20000000-0000-0000-0000-000000000002';
begin
  insert into auth.users (id, email) values (v_user_a, 'user_a@test.com'), (v_user_b, 'user_b@test.com');
  insert into organizations (id, name) values (v_org_a, 'Org A'), (v_org_b, 'Org B');
  insert into org_members (org_id, user_id, role) values (v_org_a, v_user_a, 'owner'), (v_org_b, v_user_b, 'owner');
  insert into category_templates (category, fields) values ('test_cat', '[]'::jsonb) on conflict do nothing;
  insert into products (id, org_id, sku, name, category, slug) values
    ('30000000-0000-0000-0000-000000000001', v_org_a, 'SKU-A1', 'Product A1', 'test_cat', 'product-a1'),
    ('30000000-0000-0000-0000-000000000002', v_org_b, 'SKU-B1', 'Product B1', 'test_cat', 'product-b1');
end $$;

set local role authenticator;
set local "request.jwt.claims" to '{"sub":"20000000-0000-0000-0000-000000000001","role":"authenticated"}';

select is(
  (select count(*)::int from products),
  1,
  'User A should see only 1 product'
);

select is(
  (select count(*)::int from products where org_id = '10000000-0000-0000-0000-000000000002'),
  0,
  'User A should not see Org B products'
);

set local "request.jwt.claims" to '{"sub":"20000000-0000-0000-0000-000000000002","role":"authenticated"}';

select is(
  (select count(*)::int from products),
  1,
  'User B should see only 1 product'
);

select is(
  (select count(*)::int from products where org_id = '10000000-0000-0000-0000-000000000001'),
  0,
  'User B should not see Org A products'
);

select * from finish();
rollback;
