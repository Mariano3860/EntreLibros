import { query } from '../db.js';

const ACCENTED_CHARACTERS = 'áéíóúüñàèìòùäëïöüâêîôûç';
const PLAIN_CHARACTERS = 'aeiouunaeiouaeiouc';
const MAX_RESULTS = 20;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+(?:\.[^\s@]+)+$/;

export type PersonSearchResult = {
  id: number;
  name: string;
  alias: string;
  profilePhoto: string | null;
  booksCount: number;
  exchangeCount: number;
  isFollowing: boolean;
};

type PersonSearchRow = {
  id: number;
  name: string;
  alias: string;
  profile_photo: string | null;
  books_count: number | string;
  exchange_count: number | string;
  is_following: boolean;
};

const normalizedColumn = (column: string) =>
  `translate(lower(COALESCE(${column}, '')), '${ACCENTED_CHARACTERS}', '${PLAIN_CHARACTERS}')`;

export const normalizePersonSearchTerm = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');

const baseWhere = `
  u.id <> $1
  AND u.role = 'user'
  AND COALESCE(u.profile_visibility, 'public') = 'public'
  AND NOT EXISTS (
    SELECT 1
    FROM user_blocks blocked
    WHERE (blocked.blocker_id = $1 AND blocked.blocked_id = u.id)
       OR (blocked.blocker_id = u.id AND blocked.blocked_id = $1)
  )`;

const selectFields = `
  SELECT
    u.id,
    u.name,
    COALESCE(NULLIF(TRIM(u.alias), ''), u.name) AS alias,
    u.profile_photo_url AS profile_photo,
    (
      SELECT COUNT(*)
      FROM book_listings listing
      WHERE listing.user_id = u.id
        AND listing.availability = 'public'
        AND listing.is_draft = false
        AND listing.status = 'available'
        AND listing.editorial_status = 'approved'
        AND (listing.expires_at IS NULL OR listing.expires_at > NOW())
    ) AS books_count,
    (
      SELECT COUNT(*)
      FROM exchange_agreements agreement
      WHERE agreement.state = 'completed'
        AND (agreement.proposer_id = u.id OR agreement.participant_id = u.id)
    ) AS exchange_count,
    EXISTS (
      SELECT 1
      FROM user_follows following
      WHERE following.follower_id = $1
        AND following.followed_id = u.id
    ) AS is_following
  FROM users u`;

const toPersonSearchResult = (row: PersonSearchRow): PersonSearchResult => ({
  id: Number(row.id),
  name: row.name,
  alias: row.alias,
  profilePhoto: row.profile_photo,
  booksCount: Number(row.books_count),
  exchangeCount: Number(row.exchange_count),
  isFollowing: Boolean(row.is_following),
});

const escapeLikeTerm = (value: string): string =>
  value.replace(/[\\%_]/g, (character) => `\\${character}`);

export async function searchPeople(
  viewerId: number,
  rawTerm: string
): Promise<PersonSearchResult[]> {
  const term = normalizePersonSearchTerm(rawTerm);
  if (!term) return [];

  if (/^\d+$/.test(term)) {
    const id = Number(term);
    if (!Number.isSafeInteger(id) || id <= 0) return [];
    const { rows } = await query<PersonSearchRow>(
      `${selectFields}
       WHERE ${baseWhere}
         AND u.id = $2
       ORDER BY u.id ASC
       LIMIT ${MAX_RESULTS}`,
      [viewerId, id]
    );
    return rows.map(toPersonSearchResult);
  }

  if (EMAIL_PATTERN.test(term)) {
    const { rows } = await query<PersonSearchRow>(
      `${selectFields}
       WHERE ${baseWhere}
         AND lower(TRIM(u.email)) = $2
       ORDER BY u.id ASC
       LIMIT ${MAX_RESULTS}`,
      [viewerId, term]
    );
    return rows.map(toPersonSearchResult);
  }

  const name = normalizedColumn('u.name');
  const alias = normalizedColumn('u.alias');
  const textTerm = term.startsWith('@') ? term.slice(1) : term;
  const likeTerm = escapeLikeTerm(textTerm);
  const { rows } = await query<PersonSearchRow>(
    `${selectFields}
     WHERE ${baseWhere}
       AND (
         ${name} LIKE '%' || $3 || '%' ESCAPE CHR(92)
         OR ${alias} LIKE '%' || $3 || '%' ESCAPE CHR(92)
       )
     ORDER BY
       CASE
         WHEN ${name} = $2 OR ${alias} = $2 THEN 0
         WHEN ${name} LIKE $3 || '%' ESCAPE CHR(92)
           OR ${alias} LIKE $3 || '%' ESCAPE CHR(92) THEN 1
         ELSE 2
       END,
       ${name} ASC,
       u.id ASC
     LIMIT ${MAX_RESULTS}`,
    [viewerId, textTerm, likeTerm]
  );
  return rows.map(toPersonSearchResult);
}
