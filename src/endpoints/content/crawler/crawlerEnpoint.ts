import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { AppContext } from '../../../types';
import { toNonAccentVietnamese } from '../../../utils/string';
import { parseHTML } from 'linkedom';

const crawlerSchema = z.object({
  urls: z.array(z.string().url()).min(1),
  bookId: z.number().int()
});

export class CrawlerEndpoint extends OpenAPIRoute {
  schema = {
    tags: ['Content'],
    summary: 'Crawl questions and answers from URLs',
    request: {
      body: {
        content: {
          'application/json': {
            schema: crawlerSchema
          }
        }
      }
    },
    responses: {
      '200': {
        description: 'Crawling successful',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              results: z.array(
                z.object({
                  url: z.string(),
                  questionsCount: z.number()
                })
              )
            })
          }
        }
      }
    }
  };

  async handle(c: AppContext) {
    const { body } = await this.getValidatedData<any>();
    const db = c.env.DB;
    const results = [];

    for (const url of body.urls) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }

        const html = await response.text();
        const { document } = parseHTML(html);

        const items = document.querySelectorAll(
          '#questionPreviewList > .js-qitem'
        );

        let count = 0;
        for (const item of items) {
          const nameEl = item.querySelector('.quiz-answer-left strong');
          const questionEl = item.querySelector(
            '.quiz-answer-left h4.title-question'
          );
          const answerEl = item.querySelector('.quiz-answer-right .question');

          const nameText = nameEl?.textContent?.trim() || '';
          const questionText = questionEl?.textContent?.trim() || '';
          const answerText = answerEl?.textContent?.trim() || '';

          if (nameText || questionText) {
            await db
              .prepare(
                'INSERT INTO question (name, unsignedName, question, answer, bookId) VALUES (?, ?, ?, ?, ?)'
              )
              .bind(
                nameText,
                toNonAccentVietnamese(nameText),
                questionText,
                answerText,
                body.bookId
              )
              .run();
            count++;
          }
        }

        results.push({ url, questionsCount: count });
      } catch (error: any) {
        console.error(`Error crawling ${url}:`, error);
        results.push({
          url,
          error: error.message,
          stack: error.stack,
          questionsCount: 0
        });
      }
    }

    return {
      success: true,
      results
    };
  }
}

