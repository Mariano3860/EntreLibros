ALTER TABLE books
  ADD COLUMN author TEXT,
  ADD COLUMN isbn TEXT,
  ADD COLUMN publisher TEXT,
  ADD COLUMN published_year INT,
  ADD COLUMN verified BOOLEAN NOT NULL DEFAULT false;
