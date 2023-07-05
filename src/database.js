import pg from 'pg';
import { models } from './models.js';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL + '?sslmode=require',
});

const pgClient = await pool.connect();

await pgClient.query(`
  CREATE TABLE IF NOT EXISTS user_state (
    user_id BIGINT PRIMARY KEY,
    current_model TEXT
  );
`);

async function getUserCurrentModel(userId) {
  const query = 'SELECT current_model FROM user_state WHERE user_id = $1;';
  const values = [userId];
  const result = await pgClient.query(query, values);
  if (result.rows.length > 0) {
    return result.rows[0].current_model;
  } else {
    return models.default;
  }
}

async function setCurrentModel(userId, newModel) {
  const currentModel = newModel;
  const query =
    'INSERT INTO user_state (user_id, current_model) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET current_model = $2;';
  const values = [userId, currentModel];
  await pgClient.query(query, values);
  return currentModel;
}

export { pool, getUserCurrentModel, setCurrentModel };
