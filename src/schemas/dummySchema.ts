import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const DummySchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  created_at: z.date().optional(),
});

export type DummyType = z.infer<typeof DummySchema> & {
  _id: string | ObjectId;
};
