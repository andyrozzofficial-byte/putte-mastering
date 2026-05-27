-- Production: increase `uploads` bucket file size limit to 500 MB.
-- Run in Supabase SQL Editor if migrations are not applied to the hosted project.

UPDATE storage.buckets
SET file_size_limit = 524288000
WHERE id = 'uploads';
