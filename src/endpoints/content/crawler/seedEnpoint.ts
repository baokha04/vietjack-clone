import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { AppContext } from '../../../types';
import { toNonAccentVietnamese } from '../../../utils/string';
import { checkDuplicate } from '../../../utils/db';
import initData from './init-data.json';

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
      let wasInserted = false;

      // 1. Insert/Get Publisher
      let publisherId: number;
      const existingPublisher = await checkDuplicate(db, 'publisher', unsignedName);

      if (existingPublisher) {
        publisherId = existingPublisher.id;
        console.log(`Publisher already exists with ID: ${publisherId}`);
      } else {
        const publisherResult = await db
          .prepare(
            'INSERT INTO publisher (name, unsignedName) VALUES (?, ?) RETURNING id'
          )
          .bind(publisher.name, unsignedName)
          .first<{ id: number }>();

        if (!publisherResult) {
          throw new Error('Failed to insert publisher');
        }
        publisherId = publisherResult.id;
        wasInserted = true;
        console.log(`Inserted publisher with ID: ${publisherId}`);
      }

      for (const cls of publisher.class) {
        const classUnsignedName = toNonAccentVietnamese(cls.name);
        // 2. Insert/Get Class
        let classId: number;
        const existingClass = await checkDuplicate(db, 'class', classUnsignedName, {
          column: 'publisherId',
          value: publisherId
        });

        if (existingClass) {
          classId = existingClass.id;
          console.log(`Class ${cls.name} already exists with ID: ${classId}`);
        } else {
          const classResult = await db
            .prepare(
              'INSERT INTO class (name, unsignedName, publisherId) VALUES (?, ?, ?) RETURNING id'
            )
            .bind(cls.name, classUnsignedName, publisherId)
            .first<{ id: number }>();

          if (!classResult) continue;
          classId = classResult.id;
          wasInserted = true;
          console.log(`Inserted class ${cls.name} with ID: ${classId}`);
        }

        for (const sub of cls.subject) {
          const subjectUnsignedName = toNonAccentVietnamese(sub.name);
          // 3. Insert/Get Subject
          let subjectId: number;
          const existingSubject = await checkDuplicate(
            db,
            'subject',
            subjectUnsignedName,
            {
              column: 'classId',
              value: classId
            }
          );

          if (existingSubject) {
            subjectId = existingSubject.id;
            console.log(`Subject ${sub.name} already exists with ID: ${subjectId}`);
          } else {
            const subjectResult = await db
              .prepare(
                'INSERT INTO subject (name, unsignedName, classId) VALUES (?, ?, ?) RETURNING id'
              )
              .bind(sub.name, subjectUnsignedName, classId)
              .first<{ id: number }>();

            if (!subjectResult) continue;
            subjectId = subjectResult.id;
            wasInserted = true;
            console.log(`Inserted subject ${sub.name} with ID: ${subjectId}`);
          }

          for (const book of sub.book) {
            const bookUnsignedName = toNonAccentVietnamese(book.name);
            // 4. Insert/Get Book
            const existingBook = await checkDuplicate(db, 'book', bookUnsignedName, {
              column: 'subjectId',
              value: subjectId
            });

            if (existingBook) {
              console.log(`Book ${book.name} already exists, skipping`);
            } else {
              await db
                .prepare(
                  'INSERT INTO book (name, unsignedName, subjectId) VALUES (?, ?, ?)'
                )
                .bind(book.name, bookUnsignedName, subjectId)
                .run();
              wasInserted = true;
              console.log(`Inserted book ${book.name}`);
            }
          }
        }
      }
      console.log('Seeding completed successfully');

      return {
        success: true,
        message: wasInserted
          ? 'Database seeded successfully'
          : 'Database already seeded'
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

