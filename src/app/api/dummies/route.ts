import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/backend/lib/db/connectToDatabase';
import { DummySchema } from '@/schemas/dummySchema';
import { handleApiError } from '@/backend/lib/functions/errorHandler';
import { DB_COLLECTIONS } from '@/backend/constants/dbCollections';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    const createdAtSort = url.searchParams.get('created_at_sort') || 'asc';

    const client = await connectToDatabase();
    const db = client.db();

    const filter: Record<string, string> = {};
    if (status) {
      filter.status = status;
    }
    console.log('GET DB_COLLECTIONS.DUMMIES', DB_COLLECTIONS.DUMMIES);
    const dummies = await db
      .collection(DB_COLLECTIONS.DUMMIES)
      .find(filter)
      .sort({ created_at: createdAtSort === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const totalDocuments = await db
      .collection(DB_COLLECTIONS.DUMMIES)
      .countDocuments(filter);
    const totalPages = Math.ceil(totalDocuments / limit);
    return NextResponse.json(
      {
        dummies,
        pagination: {
          page,
          limit,
          totalPages,
          totalDocuments,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    // Parse and validate the request body
    const body = await req.json();
    const validatedData = DummySchema.parse({
      ...body,
      created_at: new Date(),
    });

    // Proceed with using validatedData for database insertion
    const client = await connectToDatabase();
    const db = client.db();
    const result = await db
      .collection(DB_COLLECTIONS.DUMMIES)
      .insertOne(validatedData);
    return NextResponse.json(
      {
        message: 'Dummy created',
        dummy: validatedData,
        id: result.insertedId,
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
