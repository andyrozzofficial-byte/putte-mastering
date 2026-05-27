-- Raise Storage limit for the `uploads` bucket to 500 MB (customer + master files).
-- Hosted Supabase: run via SQL editor or `supabase db push` after linking the project.
-- Also verify Dashboard → Storage → uploads → file size limit if the UI overrides this.

UPDATE storage.buckets
SET file_size_limit = 524288000
WHERE id = 'uploads';
