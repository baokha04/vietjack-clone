import { Hono } from 'hono';
import { fromHono } from 'chanfana';
import { crawlerRouter } from './crawler';
import { publisherRouter } from './publisher';
import { classRouter } from './class';
import { subjectRouter } from './subject';
import { bookRouter } from './book';

export const contentRouter = fromHono(new Hono());
// Crawler
crawlerRouter(contentRouter);
// Publisher
publisherRouter(contentRouter);
// Class
classRouter(contentRouter);
// Subject
subjectRouter(contentRouter);
// Book
bookRouter(contentRouter);

