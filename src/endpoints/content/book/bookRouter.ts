import {
  BookCreate,
  BookDelete,
  BookList,
  BookRead,
  BookUpdate
} from './bookEndpoint';

export function bookRouter(contentRouter: any) {
  contentRouter.get('/book', BookList);
  contentRouter.post('/book', BookCreate);
  contentRouter.get('/book/:id', BookRead);
  contentRouter.put('/book/:id', BookUpdate);
  contentRouter.delete('/book/:id', BookDelete);
}
