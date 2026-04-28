import { z } from 'zod';

export const subjectSchema = z.object({
  id: z.number().int(),
  name: z.string().max(512),
  unsignedName: z.string().max(512).optional(),
  description: z.string().optional(),
  deleted: z.boolean().default(false),
  classId: z.number().int().optional()
});

export const SubjectModel = {
  tableName: 'subject',
  primaryKeys: ['id'],
  schema: subjectSchema,
  serializer: (obj: any) => ({ ...obj, deleted: Boolean(obj.deleted) }),
  serializerObject: subjectSchema
};
