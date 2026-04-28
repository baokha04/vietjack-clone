import { z } from 'zod';

export const classSchema = z.object({
  id: z.number().int(),
  name: z.string().max(512),
  unsignedName: z.string().max(512).optional(),
  description: z.string().optional(),
  deleted: z.boolean().default(false),
  publisherId: z.number().int().optional()
});

export const ClassModel = {
  tableName: 'class',
  primaryKeys: ['id'],
  schema: classSchema,
  serializer: (obj: any) => ({ ...obj, deleted: Boolean(obj.deleted) }),
  serializerObject: classSchema
};
