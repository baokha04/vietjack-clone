import { CrawlerEndpoint } from './crawlerEnpoint';
import { SeedCategories } from './seedEnpoint';
import { TusachCrawlerEndpoint } from './tusachCrawlerEndpoint';

export function crawlerRouter(contentRouter: any) {
  contentRouter.post('/seed', SeedCategories);
  contentRouter.post('/crawler', CrawlerEndpoint);
  contentRouter.post('/tusach-crawler', TusachCrawlerEndpoint);
}
