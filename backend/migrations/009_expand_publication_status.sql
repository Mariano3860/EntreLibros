DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'publication_status' AND e.enumlabel = 'completed'
  ) THEN
    ALTER TYPE publication_status ADD VALUE 'completed';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'publication_status' AND e.enumlabel = 'sold'
  ) THEN
    ALTER TYPE publication_status ADD VALUE 'sold';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'publication_status' AND e.enumlabel = 'exchanged'
  ) THEN
    ALTER TYPE publication_status ADD VALUE 'exchanged';
  END IF;
END
$$;
