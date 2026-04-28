import {
  PublisherCreate,
  PublisherDelete,
  PublisherList,
  PublisherRead,
  PublisherUpdate
} from './publisherEndpoint';

export function publisherRouter(contentRouter: any) {
  contentRouter.get('/publisher', PublisherList);
  contentRouter.post('/publisher', PublisherCreate);
  contentRouter.get('/publisher/:id', PublisherRead);
  contentRouter.put('/publisher/:id', PublisherUpdate);
  contentRouter.delete('/publisher/:id', PublisherDelete);
}
