create view public_passports with (security_invoker = off) as
select p.slug, p.gtin, p.name, p.category, p.images,
       v.data, v.version, v.published_at,
       o.name as brand_name, o.logo_url
from products p
join passport_versions v on v.product_id = p.id and v.version = p.current_version
join organizations o on o.id = p.org_id
where p.status = 'published';
