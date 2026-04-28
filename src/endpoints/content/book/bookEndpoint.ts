import { D1CreateEndpoint, D1DeleteEndpoint, D1ListEndpoint, D1ReadEndpoint, D1UpdateEndpoint } from 'chanfana';
import { AppContext, HandleArgs } from '../../../types';
import { BookModel } from './bookModel';

export class BookList extends D1ListEndpoint<HandleArgs> {
  _meta = {
    model: BookModel
  };

  searchFields = ['name', 'unsignedName', 'description', 'url'];
  defaultOrderBy = 'id DESC';

  async before(filters: any) {
    filters.filters.push({ field: 'deleted', operator: '=', value: 0 });
    return filters;
  }
}

export class BookCreate extends D1CreateEndpoint<HandleArgs> {
  _meta = {
    model: BookModel,
    fields: BookModel.schema.pick({
      name: true,
      unsignedName: true,
      description: true,
      url: true,
      subjectId: true
    })
  };
}

export class BookRead extends D1ReadEndpoint<HandleArgs> {
  _meta = {
    model: BookModel
  };

  async before(filters: any) {
    filters.filters.push({ field: 'deleted', operator: '=', value: 0 });
    return filters;
  }
}

export class BookUpdate extends D1UpdateEndpoint<HandleArgs> {
  _meta = {
    model: BookModel,
    fields: BookModel.schema.pick({
      name: true,
      unsignedName: true,
      description: true,
      deleted: true,
      url: true,
      subjectId: true
    })
  };
}

export class BookDelete extends D1DeleteEndpoint<HandleArgs> {
  _meta = {
    model: BookModel
  };

  async handle(c: AppContext) {
    const { params } = await this.getValidatedData<any>();
    const db = c.env.DB;

    await db
      .prepare(`UPDATE ${BookModel.tableName} SET deleted = 1 WHERE id = ?`)
      .bind(params.id)
      .run();

    return {
      success: true,
      result: { id: params.id }
    };
  }
}
