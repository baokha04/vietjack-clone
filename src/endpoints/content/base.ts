import { z } from 'zod';

export const publisherSchema = z.object({
  id: z.number().int(),
  name: z.string().max(512),
  unsignedName: z.string().max(512).optional(),
  description: z.string().optional(),
  deleted: z.boolean().default(false)
});

export const classSchema = z.object({
  id: z.number().int(),
  name: z.string().max(512),
  unsignedName: z.string().max(512).optional(),
  description: z.string().optional(),
  deleted: z.boolean().default(false),
  publisherId: z.number().int().optional()
});

export const subjectSchema = z.object({
  id: z.number().int(),
  name: z.string().max(512),
  unsignedName: z.string().max(512).optional(),
  description: z.string().optional(),
  deleted: z.boolean().default(false),
  classId: z.number().int().optional()
});

export const bookSchema = z.object({
  id: z.number().int(),
  name: z.string().max(512),
  unsignedName: z.string().max(512).optional(),
  description: z.string().optional(),
  deleted: z.boolean().default(false),
  url: z.string().max(2048).optional(),
  subjectId: z.number().int().optional()
});

export const questionSchema = z.object({
  id: z.number().int(),
  name: z.string().max(512),
  unsignedName: z.string().max(512).optional(),
  description: z.string().optional(),
  deleted: z.boolean().default(false),
  answer: z.string().optional(),
  bookId: z.number().int().optional()
});

export const PublisherModel = {
  tableName: 'publisher',
  primaryKeys: ['id'],
  schema: publisherSchema,
  serializer: (obj: any) => ({ ...obj, deleted: Boolean(obj.deleted) }),
  serializerObject: publisherSchema
};

export const ClassModel = {
  tableName: 'class',
  primaryKeys: ['id'],
  schema: classSchema,
  serializer: (obj: any) => ({ ...obj, deleted: Boolean(obj.deleted) }),
  serializerObject: classSchema
};

export const SubjectModel = {
  tableName: 'subject',
  primaryKeys: ['id'],
  schema: subjectSchema,
  serializer: (obj: any) => ({ ...obj, deleted: Boolean(obj.deleted) }),
  serializerObject: subjectSchema
};

export const BookModel = {
  tableName: 'book',
  primaryKeys: ['id'],
  schema: bookSchema,
  serializer: (obj: any) => ({ ...obj, deleted: Boolean(obj.deleted) }),
  serializerObject: bookSchema
};

export const QuestionModel = {
  tableName: 'question',
  primaryKeys: ['id'],
  schema: questionSchema,
  serializer: (obj: any) => ({ ...obj, deleted: Boolean(obj.deleted) }),
  serializerObject: questionSchema
};

