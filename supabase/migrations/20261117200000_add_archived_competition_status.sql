-- Allow competitions to be archived without deleting their history.
ALTER TYPE public.competition_status ADD VALUE IF NOT EXISTS 'archived';
