// src/utils/testUtils.ts
import { Db } from 'mongodb';

interface VerifyDocumentInDatabaseOptions {
  db: Db;
  collectionName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expectedFields: Record<string, any>;
}

export async function fetchAndVerifyDocumentInDatabase({
  db,
  collectionName,
  filter,
  expectedFields,
}: VerifyDocumentInDatabaseOptions) {
  const document = await db.collection(collectionName).findOne(filter);
  expect(document).not.toBeNull();

  // Check each expected field
  for (const [key, value] of Object.entries(expectedFields)) {
    expect(document?.[key]).toBe(value);
  }

  return document;
}
