import { z } from 'zod';

export const publisherSchema = z.object({
  id: z.number().int(),
  name: z.string().max(512),
  unsignedName: z.string().max(512).optional(),
  description: z.string().optional(),
  deleted: z.boolean().default(false)
});

export const PublisherModel = {
  tableName: 'publisher',
  primaryKeys: ['id'],
  schema: publisherSchema,
  serializer: (obj: any) => ({ ...obj, deleted: Boolean(obj.deleted) }),
  serializerObject: publisherSchema
};
