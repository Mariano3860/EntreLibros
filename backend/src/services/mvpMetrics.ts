import { query } from '../db.js';

export type MvpMetrics = {
  period: { days: number; from: string; to: string };
  zone: string;
  status: 'data' | 'no_data';
  activeCorners: number;
  activeListings: number;
  confirmedAgreements: number;
  discoveryTimeMinutes: number | null;
  funnel: {
    publications: number;
    contacts: number;
    agreements: number;
    confirmations: number;
  };
  lastUpdatedAt: string | null;
};

const validDays = new Set([7, 30, 90]);

export async function getMvpMetrics(
  days = 30,
  zone = 'all',
  now = new Date()
): Promise<MvpMetrics> {
  const safeDays = validDays.has(days) ? days : 30;
  const from = new Date(now.getTime() - safeDays * 24 * 60 * 60 * 1000);
  const [counts, funnel, discovery, latest] = await Promise.all([
    query<{
      active_corners: number | string;
      active_listings: number | string;
      confirmed_agreements: number | string;
    }>(
      `SELECT
        (SELECT COUNT(*)
         FROM community_corners
         WHERE status = 'active' AND draft = false AND consent = true
           AND editorial_status = 'approved') AS active_corners,
        (SELECT COUNT(*)
         FROM book_listings p
         JOIN users u ON u.id = p.user_id
         WHERE p.status = 'available' AND p.availability = 'public'
           AND p.is_draft = false AND p.editorial_status = 'approved'
           AND (p.expires_at IS NULL OR p.expires_at > NOW())
           AND ($2 = 'all' OR u.city = $2)) AS active_listings,
        (SELECT COUNT(*)
         FROM exchange_agreements a
         JOIN users u ON u.id = a.proposer_id
         WHERE a.state IN ('confirmed', 'completed')
           AND a.updated_at >= $1
           AND ($2 = 'all' OR u.city = $2)) AS confirmed_agreements`,
      [from, zone]
    ),
    query<{
      publications: number | string;
      contacts: number | string;
      agreements: number | string;
      confirmations: number | string;
    }>(
      `SELECT
        COUNT(DISTINCT e.entity_id) FILTER (WHERE e.event_type = 'listing_published') AS publications,
        COUNT(DISTINCT e.entity_id) FILTER (WHERE e.event_type = 'contact_started') AS contacts,
        COUNT(DISTINCT e.entity_id) FILTER (WHERE e.event_type = 'agreement_created') AS agreements,
        COUNT(DISTINCT e.entity_id) FILTER (WHERE e.event_type = 'agreement_confirmed') AS confirmations
       FROM analytics_events e
       LEFT JOIN users u ON u.id = e.actor_id
       WHERE e.occurred_at >= $1
         AND ($2 = 'all' OR u.city = $2)`,
      [from, zone]
    ),
    query<{ minutes: number | string | null }>(
      `WITH published AS (
         SELECT entity_id, MIN(occurred_at) AS published_at
         FROM analytics_events e
         LEFT JOIN users u ON u.id = e.actor_id
         WHERE e.event_type = 'listing_published'
           AND e.entity_type = 'listing'
           AND e.occurred_at >= $1
           AND ($2 = 'all' OR u.city = $2)
         GROUP BY entity_id
       ), contacted AS (
         SELECT entity_id, MIN(occurred_at) AS contacted_at
         FROM analytics_events e
         LEFT JOIN users u ON u.id = e.actor_id
         WHERE e.event_type = 'contact_started'
           AND e.entity_type = 'listing'
           AND e.occurred_at >= $1
           AND ($2 = 'all' OR u.city = $2)
         GROUP BY entity_id
       )
       SELECT AVG(EXTRACT(EPOCH FROM (contacted.contacted_at - published.published_at)) / 60) AS minutes
       FROM published JOIN contacted USING (entity_id)
       WHERE contacted.contacted_at >= published.published_at`,
      [from, zone]
    ),
    query<{ latest_at: Date | null }>(
      `SELECT MAX(occurred_at) AS latest_at
       FROM analytics_events e
       LEFT JOIN users u ON u.id = e.actor_id
       WHERE e.occurred_at >= $1
         AND ($2 = 'all' OR u.city = $2)`,
      [from, zone]
    ),
  ]);
  const count = counts.rows[0];
  const values = funnel.rows[0];
  const funnelValues = {
    publications: Number(values?.publications ?? 0),
    contacts: Number(values?.contacts ?? 0),
    agreements: Number(values?.agreements ?? 0),
    confirmations: Number(values?.confirmations ?? 0),
  };
  const hasData =
    Number(count?.active_corners ?? 0) > 0 ||
    Number(count?.active_listings ?? 0) > 0 ||
    Object.values(funnelValues).some((value) => value > 0);
  const minutes = discovery.rows[0]?.minutes;
  return {
    period: { days: safeDays, from: from.toISOString(), to: now.toISOString() },
    zone,
    status: hasData ? 'data' : 'no_data',
    activeCorners: Number(count?.active_corners ?? 0),
    activeListings: Number(count?.active_listings ?? 0),
    confirmedAgreements: Number(count?.confirmed_agreements ?? 0),
    discoveryTimeMinutes:
      minutes === null || minutes === undefined ? null : Number(minutes),
    funnel: funnelValues,
    lastUpdatedAt: latest.rows[0]?.latest_at?.toISOString() ?? null,
  };
}
