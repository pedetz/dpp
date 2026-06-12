-- Storage RLS policies for product-images and certifications buckets
--
-- Supabase enables RLS on storage.objects automatically when buckets are created,
-- but we document it here and add explicit policies.
--
-- Path conventions:
--   product-images : {org_id}/{product_id}/{filename}
--   certifications : {org_id}/{product_id}/{filename}
--
-- The first path segment (split_part(name, '/', 1)) is always the org_id.

-- ============================================================
-- product-images bucket
-- ============================================================

-- Anyone (including unauthenticated visitors) can read product images,
-- because they are referenced from the public_passports view.
create policy "public read product-images"
  on storage.objects for select
  using (
    bucket_id = 'product-images'
  );

-- Only authenticated members of the owning org may upload images.
-- The first folder segment of the stored path must match an org the user belongs to.
create policy "org members insert product-images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and auth.uid() is not null
    and exists (
      select 1 from public.org_members
      where org_id = split_part(name, '/', 1)::uuid
        and user_id = auth.uid()
        and role in ('owner', 'editor')
    )
  );

-- Org members (owner/editor) may delete their own org's images.
create policy "org members delete product-images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and auth.uid() is not null
    and exists (
      select 1 from public.org_members
      where org_id = split_part(name, '/', 1)::uuid
        and user_id = auth.uid()
        and role in ('owner', 'editor')
    )
  );

-- ============================================================
-- certifications bucket (private -- signed URLs only)
-- ============================================================

-- Only org members may read their own certifications.
-- Public anonymous access is intentionally NOT granted; callers must
-- generate a signed URL via the Supabase Storage API.
create policy "org members read certifications"
  on storage.objects for select
  using (
    bucket_id = 'certifications'
    and auth.uid() is not null
    and exists (
      select 1 from public.org_members
      where org_id = split_part(name, '/', 1)::uuid
        and user_id = auth.uid()
    )
  );

-- Org editors/owners may upload certification files.
create policy "org members insert certifications"
  on storage.objects for insert
  with check (
    bucket_id = 'certifications'
    and auth.uid() is not null
    and exists (
      select 1 from public.org_members
      where org_id = split_part(name, '/', 1)::uuid
        and user_id = auth.uid()
        and role in ('owner', 'editor')
    )
  );

-- Org editors/owners may delete certification files.
create policy "org members delete certifications"
  on storage.objects for delete
  using (
    bucket_id = 'certifications'
    and auth.uid() is not null
    and exists (
      select 1 from public.org_members
      where org_id = split_part(name, '/', 1)::uuid
        and user_id = auth.uid()
        and role in ('owner', 'editor')
    )
  );
