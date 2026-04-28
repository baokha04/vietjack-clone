import {
  ClassCreate,
  ClassDelete,
  ClassList,
  ClassRead,
  ClassUpdate
} from './classEndpoint';

export function classRouter(contentRouter: any) {
  contentRouter.get('/class', ClassList);
  contentRouter.post('/class', ClassCreate);
  contentRouter.get('/class/:id', ClassRead);
  contentRouter.put('/class/:id', ClassUpdate);
  contentRouter.delete('/class/:id', ClassDelete);
}
