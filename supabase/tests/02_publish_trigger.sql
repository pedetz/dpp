begin;

select plan(4);

do $$
declare
  v_org uuid := '40000000-0000-0000-0000-000000000001';
  v_product uuid := '50000000-0000-0000-0000-000000000001';
begin
  insert into organizations (id, name, plan) values (v_org, 'Trigger Test Org', 'pro');
  insert into category_templates (category, fields) values ('trigger_cat', '[]'::jsonb) on conflict do nothing;
  insert into products (id, org_id, sku, name, category, slug, data)
  values (v_product, v_org, 'TRIG-001', 'Trigger Product', 'trigger_cat', 'trigger-product', '{"key":"value"}'::jsonb);
end $$;

select is(
  (select current_version from products where id = '50000000-0000-0000-0000-000000000001'),
  0,
  'initial current_version should be 0'
);

update products set status = 'published' where id = '50000000-0000-0000-0000-000000000001';

select is(
  (select current_version from products where id = '50000000-0000-0000-0000-000000000001'),
  1,
  'after first publish, current_version should be 1'
);

select is(
  (select count(*)::int from passport_versions where product_id = '50000000-0000-0000-0000-000000000001'),
  1,
  'should have 1 passport_version snapshot'
);

select is(
  (select version from passport_versions where product_id = '50000000-0000-0000-0000-000000000001'),
  1,
  'passport_version version should be 1'
);

select * from finish();
rollback;
