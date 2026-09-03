import { query } from '../db.js';

export type ReportTargetType = 'content' | 'conduct' | 'corner_missing';
export type ReportStatus = 'received' | 'in_review' | 'resolved' | 'dismissed';

export type Report = {
  id: number;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  status: ReportStatus;
  channel: string;
  dueAt: string;
  createdAt: string;
};

type ReportRow = {
  id: number;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  status: ReportStatus;
  channel: string;
  due_at: Date;
  created_at: Date;
};

const mapReport = (row: ReportRow): Report => ({
  id: Number(row.id),
  targetType: row.target_type,
  targetId: row.target_id,
  reason: row.reason,
  status: row.status,
  channel: row.channel,
  dueAt: row.due_at.toISOString(),
  createdAt: row.created_at.toISOString(),
});

export async function createReport(input: {
  reporterId: number;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
}): Promise<Report> {
  const result = await query<ReportRow>(
    `INSERT INTO reports (reporter_id, target_type, target_id, reason)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (reporter_id, target_type, target_id) DO UPDATE
       SET reason = EXCLUDED.reason, updated_at = NOW()
     RETURNING id, target_type, target_id, reason, status, channel, due_at, created_at`,
    [input.reporterId, input.targetType, input.targetId, input.reason]
  );
  return mapReport(result.rows[0]);
}
