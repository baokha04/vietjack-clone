import { Hono } from 'hono';
import { fromHono } from 'chanfana';
import { SeedCategories } from './seed';
import { CrawlerEndpoint } from './crawler';

export const contentRouter = fromHono(new Hono());

contentRouter.post('/seed', SeedCategories);
contentRouter.post('/crawler', CrawlerEndpoint);

