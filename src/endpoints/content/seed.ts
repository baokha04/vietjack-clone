import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { AppContext } from '../../types';
import { toNonAccentVietnamese } from '../../utils/string';
import initData from '../../../.gemini/docs/db/init-data.json';

export class SeedCategories extends OpenAPIRoute {
  schema = {
    tags: ['Content'],
    summary: 'Seed categories from init-data.json',
    responses: {
      '200': {
        description: 'Seeding successful',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              message: z.string()
            })
          }
        }
      }
    }
  };

  async handle(c: AppContext) {
    const db = c.env.DB;

    try {
      console.log('Seeding started...');
      const publisher = initData.publisher;
      console.log(`Publisher: ${publisher.name}`);
      const unsignedName = toNonAccentVietnamese(publisher.name);

      // 0. Check if publisher exists
      const existingPublisher = await db
        .prepare('SELECT id FROM publisher WHERE unsignedName = ?')
        .bind(unsignedName)
        .first<{ id: number }>();

      if (existingPublisher) {
        console.log('Publisher already exists, skipping seeding');
        return {
          success: true,
          message: 'Database already seeded'
        };
      }

      // 1. Insert Publisher
      const publisherResult = await db
        .prepare(
          'INSERT INTO publisher (name, unsignedName) VALUES (?, ?) RETURNING id'
        )
        .bind(publisher.name, toNonAccentVietnamese(publisher.name))
        .first<{ id: number }>();

      if (!publisherResult) {
        throw new Error('Failed to insert publisher');
      }

      const publisherId = publisherResult.id;
      console.log(`Inserted publisher with ID: ${publisherId}`);

      for (const cls of publisher.class) {
        // 2. Insert Class
        const classResult = await db
          .prepare(
            'INSERT INTO class (name, unsignedName, publisherId) VALUES (?, ?, ?) RETURNING id'
          )
          .bind(cls.name, toNonAccentVietnamese(cls.name), publisherId)
          .first<{ id: number }>();

        if (!classResult) continue;
        const classId = classResult.id;

        for (const sub of cls.subject) {
          // 3. Insert Subject
          const subjectResult = await db
            .prepare(
              'INSERT INTO subject (name, unsignedName, classId) VALUES (?, ?, ?) RETURNING id'
            )
            .bind(sub.name, toNonAccentVietnamese(sub.name), classId)
            .first<{ id: number }>();

          if (!subjectResult) continue;
          const subjectId = subjectResult.id;

          for (const book of sub.book) {
            // 4. Insert Book
            await db
              .prepare(
                'INSERT INTO book (name, unsignedName, subjectId) VALUES (?, ?, ?)'
              )
              .bind(book.name, toNonAccentVietnamese(book.name), subjectId)
              .run();
          }
        }
      }
      console.log('Seeding completed successfully');

      return {
        success: true,
        message: 'Database seeded successfully'
      };
    } catch (error: any) {
      console.error('Seeding error:', error);
      return c.json(
        {
          success: false,
          message: error.message,
          stack: error.stack,
          initDataKeys: Object.keys(initData || {})
        },
        500
      );
    }
  }
}

