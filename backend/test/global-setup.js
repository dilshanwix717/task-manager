/* creates the dedicated e2e database before the suites run */
const { Client } = require('pg');

module.exports = async () => {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres',
  });

  await client.connect();

  const dbName = 'task_tracker_test';
  const existing = await client.query(
    'SELECT 1 FROM pg_database WHERE datname = $1',
    [dbName],
  );

  if (existing.rowCount === 0) {
    await client.query(`CREATE DATABASE ${dbName}`);
  }

  await client.end();
};
