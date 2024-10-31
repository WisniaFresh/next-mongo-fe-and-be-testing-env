// src/utils/testDatabaseSetup.ts
import { Db, MongoClient } from 'mongodb';
import { connectToDatabase } from '@/backend/lib/db/connectToDatabase';

interface TestDatabaseSetup {
  client: MongoClient;
  db: Db;
  closeConnection: () => Promise<void>;
}

export async function setupTestDatabase(): Promise<TestDatabaseSetup> {
  const client = await connectToDatabase();
  const db = client.db();

  // Provide a way to close the database connection
  const closeConnection = async () => {
    await client.close();
  };

  return { client, db, closeConnection };
}
