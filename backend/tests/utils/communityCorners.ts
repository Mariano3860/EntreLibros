import { pool } from '../../src/db.js';

export const truncateCommunityCornerTables = async (): Promise<void> => {
  await pool.query(
    'TRUNCATE community_corner_photos, community_corner_metrics, community_corners RESTART IDENTITY CASCADE'
  );
};
