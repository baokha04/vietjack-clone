import { z } from 'zod';

export const bookSchema = z.object({
  id: z.number().int(),
  name: z.string().max(512),
  unsignedName: z.string().max(512).optional(),
  description: z.string().optional(),
  deleted: z.boolean().default(false),
  url: z.string().max(2048).optional(),
  subjectId: z.number().int().optional()
});

export const BookModel = {
  tableName: 'book',
  primaryKeys: ['id'],
  schema: bookSchema,
  serializer: (obj: any) => ({ ...obj, deleted: Boolean(obj.deleted) }),
  serializerObject: bookSchema
};
