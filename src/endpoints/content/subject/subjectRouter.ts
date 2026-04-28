import {
  SubjectCreate,
  SubjectDelete,
  SubjectList,
  SubjectRead,
  SubjectUpdate
} from './subjectEndpoint';

export function subjectRouter(contentRouter: any) {
  contentRouter.get('/subject', SubjectList);
  contentRouter.post('/subject', SubjectCreate);
  contentRouter.get('/subject/:id', SubjectRead);
  contentRouter.put('/subject/:id', SubjectUpdate);
  contentRouter.delete('/subject/:id', SubjectDelete);
}
