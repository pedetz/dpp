-- Performance indexes
--
-- Rationale for each index is documented inline.

-- products -------------------------------------------------------

-- RLS policies filter by org_id on every query; index is critical.
create index if not exists idx_products_org_id
  on products (org_id);

-- Dashboard queries filter by status (draft / published / archived).
create index if not exists idx_products_status
  on products (status);

-- public_passports view is keyed by slug (URL /p/{slug}).
-- Also used by the unique constraint, but an explicit named index makes
-- query plans easier to read and lets us add INCLUDE columns later.
create index if not exists idx_products_slug
  on products (slug);

-- URL /01/{gtin} lookup — must be fast for public passport reads.
create index if not exists idx_products_gtin
  on products (gtin)
  where gtin is not null;

-- passport_versions -----------------------------------------------

-- Join from products to passport_versions uses product_id; also used
-- when listing version history ordered by most-recent first.
create index if not exists idx_passport_versions_product_id_published_at
  on passport_versions (product_id, published_at desc);

-- org_members -----------------------------------------------------

-- RLS sub-selects of the form "where user_id = auth.uid()" hit this
-- table on almost every query. Without an index the scan is O(N) per
-- row in the outer table.
create index if not exists idx_org_members_user_id
  on org_members (user_id);

-- category_templates -----------------------------------------------

-- products.category is a FK to category_templates.category; template
-- lookups (e.g., fetching field definitions for a given category) use
-- the category text column which already has a UNIQUE constraint
-- (implicitly indexed), but we document the intent here.
-- The unique constraint on category_templates(category) created in the
-- initial schema already provides the necessary index; no additional
-- index needed.

-- composite index to support lookups filtered by both category and
-- version when templates are versioned.
create index if not exists idx_category_templates_category_version
  on category_templates (category, version);
