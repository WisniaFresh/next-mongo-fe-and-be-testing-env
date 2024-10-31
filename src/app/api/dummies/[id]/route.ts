import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/backend/lib/db/connectToDatabase';
import { DB_COLLECTIONS } from '@/backend/constants/dbCollections';
import { handleApiError } from '@/backend/lib/functions/errorHandler';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const client = await connectToDatabase();
    const db = client.db();

    const dummy = await db
      .collection(DB_COLLECTIONS.DUMMIES)
      .findOne({ _id: new ObjectId(id) });

    if (!dummy) {
      return NextResponse.json({ error: 'Dummy not found' }, { status: 404 });
    }

    return NextResponse.json(dummy, { status: 200 });
  } catch (err) {
    return handleApiError(err);
  }
}
