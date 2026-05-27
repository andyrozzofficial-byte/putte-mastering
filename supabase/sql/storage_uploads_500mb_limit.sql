-- Production: increase `uploads` bucket file size limit to 500 MiB (524288000 bytes).
-- Also raise Dashboard → Storage → Settings → Global file size limit above your largest file
-- (Supabase Free plan caps the global limit at 50 MB; Pro+ can go much higher).
-- Run in Supabase SQL Editor if migrations are not applied to the hosted project.

UPDATE storage.buckets
SET file_size_limit = 524288000
WHERE id = 'uploads';
