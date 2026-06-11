begin;

select plan(4);

do $$
declare
  v_org_trial uuid := '60000000-0000-0000-0000-000000000001';
  i int;
begin
  insert into organizations (id, name, plan) values (v_org_trial, 'Trial Org', 'trial');
  insert into category_templates (category, fields) values ('limits_cat', '[]'::jsonb) on conflict do nothing;

  for i in 1..3 loop
    insert into products (org_id, sku, name, category, slug, status)
    values (v_org_trial, 'SKU-T-' || i, 'Product ' || i, 'limits_cat', 'limit-trial-product-' || i, 'published');
  end loop;
end $$;

select is(
  (select count(*)::int from products where org_id = '60000000-0000-0000-0000-000000000001' and status = 'published'),
  3,
  'trial org should have 3 published products'
);

select throws_ok(
  $$insert into products (org_id, sku, name, category, slug, status)
    values ('60000000-0000-0000-0000-000000000001', 'SKU-T-4', 'Product 4', 'limits_cat', 'limit-trial-product-4', 'published')$$,
  'Piano trial ha raggiunto il limite di 3 prodotti pubblicati',
  'trial org should not allow 4th published product'
);

do $$
declare
  v_org_starter uuid := '60000000-0000-0000-0000-000000000002';
begin
  insert into organizations (id, name, plan) values (v_org_starter, 'Starter Org', 'starter');
end $$;

select lives_ok(
  $$insert into products (org_id, sku, name, category, slug, status)
    values ('60000000-0000-0000-0000-000000000002', 'SKU-S-1', 'Starter Product 1', 'limits_cat', 'limit-starter-product-1', 'published')$$,
  'starter org should allow published products within limit'
);

select is(
  (select count(*)::int from products where org_id = '60000000-0000-0000-0000-000000000002' and status = 'published'),
  1,
  'starter org should have 1 published product'
);

select * from finish();
rollback;
