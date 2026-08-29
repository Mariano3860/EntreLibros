import { query } from '../db.js';

export type NotificationKind = 'message' | 'agreement';

export interface NotificationItem {
  id: number;
  kind: NotificationKind;
  entityId: string;
  titleKey: string;
  bodyKey: string;
  data: Record<string, string | number>;
  readAt: string | null;
  createdAt: string;
}

interface NotificationRow {
  id: number;
  kind: NotificationKind;
  entity_id: string;
  title_key: string;
  body_key: string;
  data: Record<string, string | number>;
  read_at: Date | null;
  created_at: Date;
}

const mapRow = (row: NotificationRow): NotificationItem => ({
  id: Number(row.id),
  kind: row.kind,
  entityId: row.entity_id,
  titleKey: row.title_key,
  bodyKey: row.body_key,
  data: row.data ?? {},
  readAt: row.read_at?.toISOString() ?? null,
  createdAt: row.created_at.toISOString(),
});

export async function listNotifications(
  userId: number
): Promise<NotificationItem[]> {
  const { rows } = await query<NotificationRow>(
    `SELECT id, kind, entity_id, title_key, body_key, data, read_at, created_at
     FROM notifications WHERE recipient_id = $1
     ORDER BY created_at DESC, id DESC LIMIT 100`,
    [userId]
  );
  return rows.map(mapRow);
}

export async function markNotificationRead(
  id: number,
  userId: number
): Promise<boolean> {
  const result = await query<{ id: number }>(
    `UPDATE notifications SET read_at = COALESCE(read_at, NOW())
     WHERE id = $1 AND recipient_id = $2 RETURNING id`,
    [id, userId]
  );
  return result.rows.length > 0;
}

export async function getNotificationPreference(
  userId: number
): Promise<boolean> {
  const { rows } = await query<{ in_app_enabled: boolean }>(
    `SELECT in_app_enabled FROM notification_preferences WHERE user_id = $1`,
    [userId]
  );
  return rows[0]?.in_app_enabled ?? true;
}

export async function setNotificationPreference(
  userId: number,
  enabled: boolean
): Promise<void> {
  await query(
    `INSERT INTO notification_preferences (user_id, in_app_enabled)
     VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET in_app_enabled = EXCLUDED.in_app_enabled, updated_at = NOW()`,
    [userId, enabled]
  );
}

export async function createNotification(input: {
  recipientId: number;
  kind: NotificationKind;
  entityId: string;
  titleKey: string;
  bodyKey: string;
  data?: Record<string, string | number>;
  idempotencyKey: string;
}): Promise<void> {
  if (!(await getNotificationPreference(input.recipientId))) return;
  await query(
    `INSERT INTO notifications
      (recipient_id, kind, entity_id, title_key, body_key, data, idempotency_key)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (idempotency_key) DO NOTHING`,
    [
      input.recipientId,
      input.kind,
      input.entityId,
      input.titleKey,
      input.bodyKey,
      JSON.stringify(input.data ?? {}),
      input.idempotencyKey,
    ]
  );
}
