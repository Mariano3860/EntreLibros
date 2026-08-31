import { query } from '../db.js';

export async function followUser(
  followerId: number,
  followedId: number
): Promise<void> {
  await query(
    `INSERT INTO user_follows (follower_id, followed_id)
     VALUES ($1, $2)
     ON CONFLICT (follower_id, followed_id) DO NOTHING`,
    [followerId, followedId]
  );
}

export async function unfollowUser(
  followerId: number,
  followedId: number
): Promise<void> {
  await query(
    `DELETE FROM user_follows
     WHERE follower_id = $1 AND followed_id = $2`,
    [followerId, followedId]
  );
}
