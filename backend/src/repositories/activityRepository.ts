import { query } from '../db.js';

export type UserActivityAction = 'offered' | 'exchanged';

export interface UserActivityItem {
  id: string;
  bookTitle: string;
  action: UserActivityAction;
  coverUrl: string;
  timestamp: string;
}

interface UserActivityRow {
  id: string;
  book_title: string;
  action: UserActivityAction;
  cover_url: string | null;
  timestamp: Date;
}

export async function listUserActivity(
  userId: number,
  limit = 20
): Promise<UserActivityItem[]> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 50);
  const { rows } = await query<UserActivityRow>(
    `
      SELECT id, book_title, action, cover_url, timestamp
      FROM (
        SELECT
          CONCAT('listing:', p.id)::text AS id,
          b.title AS book_title,
          'offered'::text AS action,
          COALESCE(b.cover_url, img.url) AS cover_url,
          p.created_at AS timestamp
        FROM book_listings p
        JOIN books b ON b.id = p.book_id
        LEFT JOIN LATERAL (
          SELECT url
          FROM book_listing_images
          WHERE book_listing_id = p.id
          ORDER BY is_primary DESC, id ASC
          LIMIT 1
        ) img ON true
        WHERE p.user_id = $1
          AND p.is_draft = false

        UNION ALL

        SELECT
          CONCAT('agreement:', a.id, ':listing:', ai.listing_id)::text AS id,
          b.title AS book_title,
          'exchanged'::text AS action,
          COALESCE(b.cover_url, img.url) AS cover_url,
          a.updated_at AS timestamp
        FROM exchange_agreements a
        JOIN exchange_agreement_items ai
          ON ai.agreement_id = a.id
         AND ai.version = a.current_version
         AND ai.owner_id = $1
        JOIN book_listings p ON p.id = ai.listing_id
        JOIN books b ON b.id = p.book_id
        LEFT JOIN LATERAL (
          SELECT url
          FROM book_listing_images
          WHERE book_listing_id = p.id
          ORDER BY is_primary DESC, id ASC
          LIMIT 1
        ) img ON true
        WHERE a.state = 'completed'
      ) activity
      ORDER BY timestamp DESC, id DESC
      LIMIT $2
    `,
    [userId, safeLimit]
  );

  return rows.map((row) => ({
    id: row.id,
    bookTitle: row.book_title,
    action: row.action,
    coverUrl: row.cover_url ?? '',
    timestamp: new Date(row.timestamp).toISOString(),
  }));
}
