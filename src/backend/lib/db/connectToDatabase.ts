import { MongoClient } from 'mongodb';

let cachedClient: MongoClient | null = null;

export async function connectToDatabase() {
  const dbUrl = process.env.MONGODB_URI;

  if (!dbUrl) {
    throw new Error('MONGODB_URI is not defined in environment variables.');
  }

  // Check if we have a cached client
  if (cachedClient) {
    return cachedClient;
  }

  try {
    const client = await MongoClient.connect(dbUrl);

    cachedClient = client; // Cache the client for future reuse
    return client;
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    throw new Error('Database connection failed');
  }
}
