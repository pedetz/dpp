alter table organizations enable row level security;
alter table org_members enable row level security;
alter table products enable row level security;
alter table passport_versions enable row level security;
alter table certifications enable row level security;
alter table subscriptions enable row level security;

create policy "org members read organizations" on organizations for select
  using (id in (select org_id from org_members where user_id = auth.uid()));

create policy "org owners write organizations" on organizations for all
  using (id in (select org_id from org_members where user_id = auth.uid() and role = 'owner'));

create policy "org members read org_members" on org_members for select
  using (org_id in (select org_id from org_members where user_id = auth.uid()));

create policy "org owners manage org_members" on org_members for all
  using (org_id in (select org_id from org_members where user_id = auth.uid() and role = 'owner'));

create policy "org members read products" on products for select
  using (org_id in (select org_id from org_members where user_id = auth.uid()));

create policy "org editors write products" on products for all
  using (org_id in (select org_id from org_members where user_id = auth.uid() and role in ('owner','editor')));

create policy "org members read passport_versions" on passport_versions for select
  using (product_id in (
    select id from products
    where org_id in (select org_id from org_members where user_id = auth.uid())
  ));

create policy "org editors write passport_versions" on passport_versions for all
  using (product_id in (
    select id from products
    where org_id in (select org_id from org_members where user_id = auth.uid() and role in ('owner','editor'))
  ));

create policy "org members read certifications" on certifications for select
  using (product_id in (
    select id from products
    where org_id in (select org_id from org_members where user_id = auth.uid())
  ));

create policy "org editors write certifications" on certifications for all
  using (product_id in (
    select id from products
    where org_id in (select org_id from org_members where user_id = auth.uid() and role in ('owner','editor'))
  ));

create policy "org members read subscriptions" on subscriptions for select
  using (org_id in (select org_id from org_members where user_id = auth.uid()));

create policy "org owners write subscriptions" on subscriptions for all
  using (org_id in (select org_id from org_members where user_id = auth.uid() and role = 'owner'));
