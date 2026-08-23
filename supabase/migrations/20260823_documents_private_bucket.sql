-- Provision the Phase 0 invoice archive explicitly instead of waiting for the
-- first authenticated upload. Files remain accessible only through the
-- trusted server, which returns short-lived signed URLs after ownership checks.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

