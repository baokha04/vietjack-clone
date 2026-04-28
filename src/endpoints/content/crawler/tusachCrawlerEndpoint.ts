import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { AppContext } from '../../../types';
import { toNonAccentVietnamese } from '../../../utils/string';
import { parseHTML } from 'linkedom';

const tusachCrawlerSchema = z.object({
  urls: z.array(z.string().url()).min(1),
  bookId: z.number().int()
});

export class TusachCrawlerEndpoint extends OpenAPIRoute {
  schema = {
    tags: ['Content'],
    summary: 'Crawl questions and answers from tusach.vn URLs',
    request: {
      body: {
        content: {
          'application/json': {
            schema: tusachCrawlerSchema
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
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'Referer': 'https://tusach.vn/'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }

        const html = await response.text();
        const { document } = parseHTML(html);

        // Selectors confirmed via browser investigation
        const nameEl = document.querySelector('main > article > h1');
        const questionEl = document.querySelector('[id="-bi"]');
        const answerEl = document.querySelector('[id="li-gii"]');

        const nameText = nameEl?.textContent?.trim() || '';
        const questionHtml = questionEl?.textContent?.trim() || '';
        const answerHtml = answerEl?.textContent?.trim() || '';

        let count = 0;
        if (nameText || questionHtml) {
          await db
            .prepare(
              'INSERT INTO question (name, unsignedName, question, answer, bookId) VALUES (?, ?, ?, ?, ?)'
            )
            .bind(
              nameText,
              toNonAccentVietnamese(nameText),
              questionHtml,
              answerHtml,
              body.bookId
            )
            .run();
          count = 1;
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

