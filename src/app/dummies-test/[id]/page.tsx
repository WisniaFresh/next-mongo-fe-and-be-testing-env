import { DB_COLLECTIONS } from '@/backend/constants/dbCollections';
import { connectToDatabase } from '@/backend/lib/db/connectToDatabase';
import BackButton from '@/frontend/components/BackButton';
import { DummyType } from '@/schemas/dummySchema';
import { ObjectId } from 'mongodb';

async function fetchDummy(id: string): Promise<DummyType | null> {
  const client = await connectToDatabase();
  const db = client.db();
  const result = await db
    .collection<DummyType>(DB_COLLECTIONS.DUMMIES)
    .findOne({ _id: new ObjectId(id) });
  return result;
}

async function fetchFirst10Dummies(): Promise<DummyType[] | null> {
  const client = await connectToDatabase();
  const db = client.db();
  const result = await db
    .collection<DummyType>(DB_COLLECTIONS.DUMMIES)
    .find({})
    .sort({ created_at: -1 })
    .limit(10)
    .toArray();
  return result;
}

export const revalidate = 60 * 60 * 12; // 12 hours

export async function generateStaticParams() {
  const dummiesFirst10 = await fetchFirst10Dummies();
  console.log('dummiesFirst10', dummiesFirst10);

  if (dummiesFirst10) {
    return dummiesFirst10.map((dummy) => {
      return { id: dummy._id.toString() };
    });
  }
}

const DummyDetailPage = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;

  const dummy = await fetchDummy(id);

  console.log('id', id);
  console.log('dummy', dummy);

  if (!dummy) {
    return <p className='text-center text-gray-500'>Loading...</p>;
  }

  return (
    <div className='flex min-h-screen w-full flex-col items-center bg-gray-900 p-6'>
      <div className='flex w-full flex-col items-start bg-gray-900 p-6'>
        <BackButton />
      </div>
      <h1 className='mb-8 text-4xl font-bold text-blue-600'>Dummy Details</h1>

      <div className='w-full max-w-lg rounded-lg bg-white p-6 shadow-lg'>
        <div className='mb-4'>
          <h2 className='text-xl font-semibold text-gray-800'>Name:</h2>
          <p className='text-2xl font-bold text-gray-700'>{dummy.name}</p>
        </div>
        <div className='mb-4'>
          <h2 className='text-xl font-semibold text-gray-800'>Description:</h2>
          <p className='text-lg text-gray-700'>{dummy.description}</p>
        </div>
        <div className='mb-4'>
          <h2 className='text-xl font-semibold text-gray-800'>Status:</h2>
          <p
            className={`text-lg font-semibold ${
              dummy.status === 'active' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {dummy.status === 'active' ? 'Active' : 'Inactive'}
          </p>
        </div>
        <div className='mb-4'>
          <h2 className='text-xl font-semibold text-gray-800'>Created At:</h2>
          <p className='text-lg text-gray-600'>
            {new Date(dummy.created_at || '').toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DummyDetailPage;
