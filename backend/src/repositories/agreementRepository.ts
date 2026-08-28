import { query, withTransaction } from '../db.js';
import { EventEmitter } from 'node:events';
import { areUsersBlocked } from './messagingRepository.js';
import {
  transitionAgreement,
  type AgreementCommand,
  type AgreementState,
} from '../services/agreementState.js';

export interface AgreementDetails {
  meetingPoint: string;
  area: string;
  date: string;
  time: string;
  bookTitle: string;
}

export interface AgreementSnapshot {
  id: number;
  conversationId: number;
  proposerId: number;
  participantId: number;
  state: AgreementState;
  currentVersion: number;
  details: AgreementDetails;
  acceptances: number[];
  listingIds: number[];
}

export interface AgreementHistoryEntry {
  version: number;
  actorId: number;
  state: AgreementState;
  details: AgreementDetails;
  createdAt: Date;
}

export const agreementEvents = new EventEmitter();

interface AgreementRow {
  id: number;
  conversation_id: number;
  proposer_id: number;
  participant_id: number;
  state: AgreementState;
  current_version: number;
  details: AgreementDetails;
  acceptances: number[];
  listing_ids: number[];
}

function mapRow(row: AgreementRow): AgreementSnapshot {
  return {
    id: Number(row.id),
    conversationId: Number(row.conversation_id),
    proposerId: Number(row.proposer_id),
    participantId: Number(row.participant_id),
    state: row.state,
    currentVersion: row.current_version,
    details: row.details,
    acceptances: (row.acceptances ?? []).map(Number),
    listingIds: (row.listing_ids ?? []).map(Number),
  };
}

const AGREEMENT_SELECT = `
  SELECT a.id, a.conversation_id, a.proposer_id, a.participant_id,
         a.state, a.current_version, v.details,
         COALESCE(ARRAY_AGG(DISTINCT ac.user_id) FILTER (WHERE ac.user_id IS NOT NULL), '{}') AS acceptances,
         COALESCE(ARRAY_AGG(DISTINCT ai.listing_id) FILTER (WHERE ai.listing_id IS NOT NULL), '{}') AS listing_ids
  FROM exchange_agreements a
  JOIN exchange_agreement_versions v
    ON v.agreement_id = a.id AND v.version = a.current_version
  LEFT JOIN exchange_agreement_acceptances ac
    ON ac.agreement_id = a.id AND ac.version = a.current_version
  LEFT JOIN exchange_agreement_items ai
    ON ai.agreement_id = a.id AND ai.version = a.current_version
`;

export async function getAgreement(
  id: number,
  userId: number
): Promise<AgreementSnapshot | null> {
  const { rows } = await query<AgreementRow>(
    `${AGREEMENT_SELECT}
     WHERE a.id = $1 AND (a.proposer_id = $2 OR a.participant_id = $2)
     GROUP BY a.id, v.details`,
    [id, userId]
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function getAgreementHistory(
  id: number,
  userId: number
): Promise<AgreementHistoryEntry[]> {
  const { rows } = await query<AgreementHistoryEntry>(
    `SELECT v.version, v.actor_id AS "actorId", v.state, v.details, v.created_at AS "createdAt"
     FROM exchange_agreement_versions v
     JOIN exchange_agreements a ON a.id = v.agreement_id
     WHERE v.agreement_id = $1 AND (a.proposer_id = $2 OR a.participant_id = $2)
     ORDER BY v.version ASC`,
    [id, userId]
  );
  return rows;
}

export async function createAgreement(input: {
  conversationId: number;
  proposerId: number;
  participantId: number;
  details: AgreementDetails;
  listingIds?: number[];
}): Promise<AgreementSnapshot> {
  if (await areUsersBlocked(input.proposerId, input.participantId)) {
    throw new Error('agreements.errors.forbidden');
  }
  const agreement = await withTransaction(async (client) => {
    const conversation = await client.query<{ user_id: number }>(
      `SELECT user_id FROM conversation_participants
       WHERE conversation_id = $1 ORDER BY user_id`,
      [input.conversationId]
    );
    const participants = conversation.rows.map((row) => row.user_id);
    if (
      participants.length !== 2 ||
      !participants.includes(input.proposerId) ||
      !participants.includes(input.participantId) ||
      input.proposerId === input.participantId
    ) {
      throw new Error('agreements.errors.participants_invalid');
    }
    const listingIds = [...new Set(input.listingIds ?? [])];
    if (listingIds.length > 2) {
      throw new Error('agreements.errors.listings_invalid');
    }
    const listings = listingIds.length
      ? await client.query<{ id: number; user_id: number; status: string }>(
          `SELECT id, user_id, status FROM book_listings
           WHERE id = ANY($1::integer[]) FOR UPDATE`,
          [listingIds]
        )
      : { rows: [] };
    if (
      listings.rows.length !== listingIds.length ||
      listings.rows.some(
        (listing) =>
          listing.status !== 'available' ||
          ![input.proposerId, input.participantId].includes(listing.user_id)
      )
    ) {
      throw new Error('agreements.errors.listing_unavailable');
    }
    const agreementResult = await client.query<{ id: number }>(
      `INSERT INTO exchange_agreements
       (conversation_id, proposer_id, participant_id)
       VALUES ($1, $2, $3) RETURNING id`,
      [input.conversationId, input.proposerId, input.participantId]
    );
    const id = agreementResult.rows[0].id;
    await client.query(
      `INSERT INTO exchange_agreement_versions
       (agreement_id, version, actor_id, details)
       VALUES ($1, 1, $2, $3)`,
      [id, input.proposerId, JSON.stringify(input.details)]
    );
    for (const listing of listings.rows) {
      await client.query(
        `INSERT INTO exchange_agreement_items
         (agreement_id, version, listing_id, owner_id)
         VALUES ($1, 1, $2, $3)`,
        [id, listing.id, listing.user_id]
      );
    }
    await client.query(
      `INSERT INTO agreement_events (agreement_id, version, actor_id, event_type)
       VALUES ($1, 1, $2, 'proposal')`,
      [id, input.proposerId]
    );
    const { rows } = await client.query<AgreementRow>(
      `${AGREEMENT_SELECT} WHERE a.id = $1 GROUP BY a.id, v.details`,
      [id]
    );
    return mapRow(rows[0]);
  });
  agreementEvents.emit('committed', agreement);
  return agreement;
}

export async function commandAgreement(input: {
  id: number;
  actorId: number;
  expectedVersion: number;
  command: AgreementCommand;
  reason?: string;
}): Promise<AgreementSnapshot> {
  const agreement = await withTransaction(async (client) => {
    const current = await client.query<AgreementRow>(
      `SELECT a.id, a.conversation_id, a.proposer_id, a.participant_id,
              a.state, a.current_version,
              '{}'::integer[] AS acceptances, '{}'::integer[] AS listing_ids
       FROM exchange_agreements a
       WHERE a.id = $1 AND (a.proposer_id = $2 OR a.participant_id = $2)
       FOR UPDATE OF a`,
      [input.id, input.actorId]
    );
    const row = current.rows[0];
    if (!row) throw new Error('agreements.errors.forbidden');
    if (row.current_version !== input.expectedVersion) {
      throw new Error('agreements.errors.conflict');
    }
    const version = await client.query<{ details: AgreementDetails }>(
      `SELECT details FROM exchange_agreement_versions
       WHERE agreement_id = $1 AND version = $2`,
      [input.id, row.current_version]
    );
    if (!version.rows[0]) throw new Error('agreements.errors.not_found');
    row.details = version.rows[0].details;
    const acceptanceResult = await client.query<{ user_id: number }>(
      `SELECT user_id FROM exchange_agreement_acceptances
       WHERE agreement_id = $1 AND version = $2`,
      [input.id, row.current_version]
    );
    row.acceptances = acceptanceResult.rows.map((item) => item.user_id);
    const nextState = transitionAgreement(
      row.state,
      input.command,
      input.reason
    );
    const nextVersion = row.current_version + 1;
    await client.query(
      `UPDATE exchange_agreements SET state = $2, current_version = $3, updated_at = NOW()
       WHERE id = $1`,
      [input.id, nextState, nextVersion]
    );
    await client.query(
      `INSERT INTO exchange_agreement_versions
       (agreement_id, version, actor_id, state, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        input.id,
        nextVersion,
        input.actorId,
        nextState,
        JSON.stringify(row.details),
      ]
    );
    await client.query(
      `INSERT INTO exchange_agreement_items
       (agreement_id, version, listing_id, owner_id)
       SELECT agreement_id, $2, listing_id, owner_id
       FROM exchange_agreement_items
       WHERE agreement_id = $1 AND version = $3`,
      [input.id, nextVersion, row.current_version]
    );
    if (input.command === 'confirm') {
      const acceptances = [
        ...new Set([...(row.acceptances ?? []), input.actorId]),
      ];
      for (const userId of acceptances) {
        await client.query(
          `INSERT INTO exchange_agreement_acceptances
           (agreement_id, version, user_id)
           VALUES ($1, $2, $3)`,
          [input.id, nextVersion, userId]
        );
      }
    }
    if (nextState === 'confirmed') {
      const reserved = await client.query(
        `UPDATE book_listings
         SET status = 'reserved', exchange_agreement_id = $1, updated_at = NOW()
         WHERE id IN (
           SELECT listing_id FROM exchange_agreement_items
           WHERE agreement_id = $1 AND version = $2
         ) AND status = 'available' AND exchange_agreement_id IS NULL`,
        [input.id, nextVersion]
      );
      const items = await client.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM exchange_agreement_items
         WHERE agreement_id = $1 AND version = $2`,
        [input.id, nextVersion]
      );
      if (
        Number(reserved.rowCount ?? 0) !== Number(items.rows[0]?.count ?? 0)
      ) {
        throw new Error('agreements.errors.listing_unavailable');
      }
    }
    if (['cancelled', 'rejected', 'completed'].includes(nextState)) {
      await client.query(
        `UPDATE book_listings
         SET status = 'available', exchange_agreement_id = NULL, updated_at = NOW()
         WHERE exchange_agreement_id = $1`,
        [input.id]
      );
    }
    await client.query(
      `INSERT INTO agreement_events (agreement_id, version, actor_id, event_type, reason)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        input.id,
        nextVersion,
        input.actorId,
        input.command,
        input.reason ?? null,
      ]
    );
    const { rows } = await client.query<AgreementRow>(
      `${AGREEMENT_SELECT} WHERE a.id = $1 GROUP BY a.id, v.details`,
      [input.id]
    );
    return mapRow(rows[0]);
  });
  agreementEvents.emit('committed', agreement);
  return agreement;
}

export async function counterProposeAgreement(input: {
  id: number;
  actorId: number;
  expectedVersion: number;
  details: AgreementDetails;
}): Promise<AgreementSnapshot> {
  const agreement = await withTransaction(async (client) => {
    const current = await client.query<AgreementRow>(
      `SELECT a.id, a.conversation_id, a.proposer_id, a.participant_id,
              a.state, a.current_version,
              '{}'::integer[] AS acceptances, '{}'::integer[] AS listing_ids
       FROM exchange_agreements a
       WHERE a.id = $1 AND (a.proposer_id = $2 OR a.participant_id = $2)
       FOR UPDATE OF a`,
      [input.id, input.actorId]
    );
    const row = current.rows[0];
    if (!row) throw new Error('agreements.errors.forbidden');
    if (row.current_version !== input.expectedVersion) {
      throw new Error('agreements.errors.conflict');
    }
    const version = await client.query<{ details: AgreementDetails }>(
      `SELECT details FROM exchange_agreement_versions
       WHERE agreement_id = $1 AND version = $2`,
      [input.id, row.current_version]
    );
    if (!version.rows[0]) throw new Error('agreements.errors.not_found');
    row.details = version.rows[0].details;
    const nextVersion = row.current_version + 1;
    await client.query(
      `UPDATE exchange_agreements
       SET state = 'proposed', current_version = $2, updated_at = NOW()
       WHERE id = $1`,
      [input.id, nextVersion]
    );
    await client.query(
      `INSERT INTO exchange_agreement_versions
       (agreement_id, version, actor_id, state, details)
       VALUES ($1, $2, $3, 'proposed', $4)`,
      [input.id, nextVersion, input.actorId, JSON.stringify(input.details)]
    );
    await client.query(
      `INSERT INTO exchange_agreement_items
       (agreement_id, version, listing_id, owner_id)
       SELECT agreement_id, $2, listing_id, owner_id
       FROM exchange_agreement_items
       WHERE agreement_id = $1 AND version = $3`,
      [input.id, nextVersion, row.current_version]
    );
    await client.query(
      `INSERT INTO agreement_events
       (agreement_id, version, actor_id, event_type)
       VALUES ($1, $2, $3, 'counterproposal')`,
      [input.id, nextVersion, input.actorId]
    );
    const { rows } = await client.query<AgreementRow>(
      `${AGREEMENT_SELECT} WHERE a.id = $1 GROUP BY a.id, v.details`,
      [input.id]
    );
    return mapRow(rows[0]);
  });
  agreementEvents.emit('committed', agreement);
  return agreement;
}
