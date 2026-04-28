import { CrawlerEndpoint } from './crawlerEnpoint';
import { SeedCategories } from './seedEnpoint';

export function crawlerRouter(contentRouter: any) {
  contentRouter.post('/seed', SeedCategories);
  contentRouter.post('/crawler', CrawlerEndpoint);
}
