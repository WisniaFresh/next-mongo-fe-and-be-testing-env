import { GET, POST } from './route';
import { Db } from 'mongodb';
import { fetchAndVerifyDocumentInDatabase } from '@/backend/lib/test/test_fetchAndVerifyDocumentInDatabase';
import { setupTestDatabase } from '@/backend/lib/test/test_setupDatabase';
import { DB_COLLECTIONS } from '@/backend/constants/dbCollections';
import { DummyType } from '@/schemas/dummySchema';

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

describe('/api/dummies POST handler', () => {
  const testBody = {
    name: 'Test Dummy',
    description: 'A test description',
    status: 'active',
  };

  beforeAll(async () => {
    await db.collection(DB_COLLECTIONS.DUMMIES).deleteMany({});
  });

  it('should return 201 and create a new dummy with valid data', async () => {
    const req = new Request(`${process.env.BASE_URL}/api/dummies`, {
      method: 'POST',
      body: JSON.stringify(testBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(req);
    const responseBody = await response.json();

    expect(response.status).toBe(201);
    expect(responseBody).toEqual({
      message: 'Dummy created',
      dummy: {
        _id: expect.any(String),
        created_at: expect.any(String), // Check created_at is a string (ISO date)
        ...testBody,
      },
      id: expect.any(String),
    });

    // Verify data is correctly stored in the database

    const dummy = await fetchAndVerifyDocumentInDatabase({
      db,
      collectionName: DB_COLLECTIONS.DUMMIES,
      filter: { name: testBody.name },
      expectedFields: testBody,
    });

    expect(dummy?.created_at).toBeInstanceOf(Date);

    // Optional: Additional check to confirm created_at is recent
    const now = new Date();
    const createdAt = new Date(dummy?.created_at);
    expect(createdAt.getTime()).toBeLessThanOrEqual(now.getTime());
    console.log('created_at', createdAt);
    console.log('now', now);
    expect(createdAt.getTime()).toBeGreaterThan(now.getTime() - 900000); // within the last 15 minutes

    // Cleanup
    await db.collection(DB_COLLECTIONS.DUMMIES).deleteOne({ _id: dummy?._id });
  });

  it('should return 400 if name is missing', async () => {
    const req = new Request(`${process.env.BASE_URL}/api/dummies`, {
      method: 'POST',
      body: JSON.stringify({ description: 'Missing name filed' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await POST(req);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody).toHaveProperty(
      'message',
      'Validation failed, correct the form and please try again.'
    );
    expect(responseBody).toHaveProperty('err[0].message', 'Required');
  });

  it('should return 400 if name is not a string', async () => {
    const req = new Request(`${process.env.BASE_URL}/api/dummies`, {
      method: 'POST',
      body: JSON.stringify({ name: 123, description: 'Name is a number' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await POST(req);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody).toHaveProperty(
      'message',
      'Validation failed, correct the form and please try again.'
    );
    expect(responseBody).toHaveProperty(
      'err[0].message',
      'Expected string, received number'
    );
  });
  it('should return 500 for unsupported HTTP methods', async () => {
    const req = new Request(`${process.env.BASE_URL}/api/dummies`, {
      method: 'OPTION',
    });

    const response = await POST(req);
    expect(response.status).toBe(500);
  });
});

describe('/api/dummies GET handler', () => {
  const DOCUMENTS_COUNT = 20;
  beforeAll(async () => {
    const mockedDummies = Array.from({ length: DOCUMENTS_COUNT }, (_, i) => ({
      name: `Dummy ${i + 1}`,
      status: i % 2 === 0 ? 'active' : 'inactive', // Alternate status
    }));

    await db.collection(DB_COLLECTIONS.DUMMIES).insertMany(mockedDummies);
  });

  it('should return the correct number of documents per page', async () => {
    const testPage = 2;
    const testLimit = 3;
    const req = new Request(
      `${process.env.BASE_URL}/api/dummies?page=${testPage}&limit=${testLimit}`
    );
    const response = await GET(req);
    const responseBody = await response.json();
    console.log('responseBody', responseBody);
    expect(response.status).toBe(200);
    expect(responseBody.pagination.page).toBe(testPage);
    expect(responseBody.pagination.limit).toBe(testLimit);
    expect(responseBody.pagination.totalDocuments).toBe(DOCUMENTS_COUNT);
    expect(responseBody.pagination.totalPages).toBe(
      Math.ceil(DOCUMENTS_COUNT / testLimit)
    );
    expect(responseBody.dummies.length).toBe(testLimit);
  });

  it('should filter documents based on status', async () => {
    const req = new Request(
      `${process.env.BASE_URL}/api/dummies?status=active`
    );
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    console.log('responseBody', responseBody);
    expect(responseBody.dummies.length).toBeGreaterThan(0);
    expect(
      responseBody.dummies.every((doc: DummyType) => doc.status === 'active')
    ).toBe(true);
  });

  it('should handle cases with no matching filter results', async () => {
    const req = new Request(
      `${process.env.BASE_URL}/api/dummies?status=nonexistent`
    );
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody.dummies.length).toBe(0);
    expect(responseBody.pagination.totalDocuments).toBe(0);
    expect(responseBody.pagination.totalPages).toBe(0);
  });
});
