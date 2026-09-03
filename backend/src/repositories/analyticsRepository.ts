import { query } from '../db.js';

export type AnalyticsEventType =
  | 'listing_published'
  | 'contact_started'
  | 'agreement_created'
  | 'agreement_confirmed'
  | 'agreement_reminder'
  | 'outcome_recorded';

export async function recordAnalyticsEvent(input: {
  eventType: AnalyticsEventType;
  actorId?: number;
  entityType: string;
  entityId: string;
  metadata?: Record<string, string | number>;
  idempotencyKey: string;
}): Promise<void> {
  await query(
    `INSERT INTO analytics_events
      (event_type, actor_id, entity_type, entity_id, metadata, idempotency_key)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (idempotency_key) DO NOTHING`,
    [
      input.eventType,
      input.actorId ?? null,
      input.entityType,
      input.entityId,
      JSON.stringify(input.metadata ?? {}),
      input.idempotencyKey,
    ]
  );
}
