import { GET } from './route';
import { Db, ObjectId } from 'mongodb';
import { setupTestDatabase } from '@/backend/lib/test/test_setupDatabase';
import { DB_COLLECTIONS } from '@/backend/constants/dbCollections';

let db: Db;
let closeConnection: () => Promise<void>;

beforeAll(async () => {
  const setup = await setupTestDatabase();
  db = setup.db;
  closeConnection = setup.closeConnection;
});

afterAll(async () => {
  await closeConnection();
});

describe('/api/dummies/:id GET handler', () => {
  let dummyId: ObjectId;

  beforeAll(async () => {
    // Insert a test document
    const result = await db.collection(DB_COLLECTIONS.DUMMIES).insertOne({
      name: 'Test Dummy',
      description: 'A test description',
      status: 'active',
      created_at: new Date(),
    });
    dummyId = result.insertedId;
  });

  afterAll(async () => {
    // Cleanup the document after the test
    await db.collection(DB_COLLECTIONS.DUMMIES).deleteOne({ _id: dummyId });
  });

  it('should return the dummy data for a valid ID', async () => {
    const req = new Request(
      `${process.env.BASE_URL}/api/dummies/${dummyId.toString()}`
    );
    const response = await GET(req, { params: { id: dummyId.toString() } });
    const responseBody = await response.json();
    console.log('responseBody', responseBody);

    expect(response.status).toBe(200);
    expect(responseBody).toEqual({
      _id: dummyId.toString(),
      name: 'Test Dummy',
      description: 'A test description',
      status: 'active',
      created_at: expect.any(String), // Ensure created_at is returned as a string
    });
  });

  it('should return 404 for a non-existing ID', async () => {
    const nonExistingId = '000000000000000000000000';
    const req = new Request(
      `${process.env.BASE_URL}/api/dummies/${nonExistingId}`
    );
    const response = await GET(req, { params: { id: nonExistingId } });
    const responseBody = await response.json();

    expect(response.status).toBe(404);
    expect(responseBody).toEqual({ error: 'Dummy not found' });
  });

  it('should return 400 for an invalid ID format', async () => {
    const invalidId = 'invalid-id';
    const req = new Request(`${process.env.BASE_URL}/api/dummies/${invalidId}`);
    const response = await GET(req, { params: { id: invalidId } });
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody).toEqual({ error: 'Invalid ID format' });
  });
});
