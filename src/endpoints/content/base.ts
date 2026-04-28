import { z } from 'zod';

export const questionSchema = z.object({
  id: z.number().int(),
  name: z.string().max(512),
  unsignedName: z.string().max(512).optional(),
  description: z.string().optional(),
  deleted: z.boolean().default(false),
  question: z.string().optional(),
  answer: z.string().optional(),
  bookId: z.number().int().optional()
});

export const QuestionModel = {
  tableName: 'question',
  primaryKeys: ['id'],
  schema: questionSchema,
  serializer: (obj: any) => ({ ...obj, deleted: Boolean(obj.deleted) }),
  serializerObject: questionSchema
};

