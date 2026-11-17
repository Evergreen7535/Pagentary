-- Publicly readable contestant portraits; uploads are performed only by the
-- authenticated server using the server-only Supabase secret key.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('contestant-photos', 'contestant-photos', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
