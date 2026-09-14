const RETIRED_MIGRATION_NAMES = new Set([
  'init',
  'create_users',
  'add_language_to_users',
  'add_location_to_users',
  'add_book_fields',
  'create_book_listing',
  'create_community_corners',
  'create_contact_messages',
  'expand_publication_status',
  'create_messaging',
  'create_agreements',
  'add_agreement_listing_reservations',
  'fix_agreement_reservation_index',
  'create_user_blocks',
  'seed_messaging_bot',
  'add_profile_privacy',
  'add_listing_expiry',
  'add_community_corner_owner',
  'create_notifications',
  'add_profile_interests_location',
  'create_community_stories',
  'create_community_following_and_demo_data',
  'create_book_discovery_interests',
  'seed_messaging_exchange_conversations',
  'repair_messaging_exchange_seed',
  'add_profile_photo_and_location_details',
  'create_community_social_engagement',
  'add_publication_consents',
  'add_publication_editorial_review',
  'add_corner_editorial_review',
  'add_agreement_outcomes',
  'create_reports',
  'create_analytics_events',
  'harden_reports_schema',
  'create_message_drafts',
  'add_message_delivery_cursor',
  'add_conversation_participant_visibility',
]);

const DEFAULT_APPROVED_DATABASE_NAMES = [
  'entrelibros',
  'entrelibros_baseline',
  'entrelibros_dev',
  'entrelibros_local',
  'entrelibros_test',
  'entrelibros_e2e',
];

export function getDatabaseName(connectionString) {
  const url = new URL(connectionString);
  const databaseName = decodeURIComponent(url.pathname.slice(1));

  if (!/^[A-Za-z0-9_]+$/.test(databaseName)) {
    throw new Error(
      'Migration target names may only contain letters, numbers and underscores.'
    );
  }

  return databaseName;
}

export function getApprovedMigrationDatabaseNames(environment = process.env) {
  const configured = environment.ENTRELIBROS_MIGRATION_DATABASE_NAMES;
  if (!configured) return DEFAULT_APPROVED_DATABASE_NAMES;

  return configured
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
}

export function assertApprovedMigrationTarget(
  connectionString,
  environment = process.env
) {
  const databaseName = getDatabaseName(connectionString);
  const approvedNames = getApprovedMigrationDatabaseNames(environment);

  if (!approvedNames.includes(databaseName)) {
    throw new Error(
      `Refusing to migrate database "${databaseName}". Create a new approved database and set ENTRELIBROS_MIGRATION_DATABASE_NAMES if needed. Allowed names: ${approvedNames.join(', ')}.`
    );
  }

  return databaseName;
}

export function findRetiredMigrationNames(names) {
  return names.filter((name) => RETIRED_MIGRATION_NAMES.has(name));
}

export async function assertNoRetiredMigrationLedger(client) {
  const ledger = await client.query(`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'migrations'
    ) AS exists
  `);

  if (!ledger.rows[0]?.exists) return;

  const applied = await client.query('SELECT name FROM migrations');
  const retiredNames = findRetiredMigrationNames(
    applied.rows.map((row) => row.name)
  );

  if (retiredNames.length > 0) {
    throw new Error(
      `This database has the retired migration ledger (${retiredNames.slice(0, 3).join(', ')}). Do not upgrade it in place. Keep it as a rollback reference and point DATABASE_URL to a new approved database before running migrations.`
    );
  }
}
