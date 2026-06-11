create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  vat_number text,
  logo_url text,
  plan text not null default 'trial' check (plan in ('trial','starter','pro','filiera')),
  created_at timestamptz not null default now()
);

create table org_members (
  org_id uuid references organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','editor','viewer')),
  primary key (org_id, user_id)
);

create table category_templates (
  id uuid primary key default gen_random_uuid(),
  category text not null unique,
  version int not null default 1,
  fields jsonb not null
);

create table products (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  sku text not null,
  gtin text,
  name text not null,
  category text not null references category_templates(category),
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  data jsonb not null default '{}',
  images text[] not null default '{}',
  current_version int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, sku)
);

create table passport_versions (
  product_id uuid not null references products(id) on delete cascade,
  version int not null,
  data jsonb not null,
  published_by uuid references auth.users(id),
  published_at timestamptz not null default now(),
  primary key (product_id, version)
);

create table certifications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  kind text not null,
  file_path text not null,
  valid_until date
);

create table subscriptions (
  org_id uuid primary key references organizations(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text,
  plan text not null,
  status text not null,
  current_period_end timestamptz
);
