import {
  D1CreateEndpoint,
  D1DeleteEndpoint,
  D1ListEndpoint,
  D1ReadEndpoint,
  D1UpdateEndpoint
} from 'chanfana';
import { AppContext, HandleArgs } from '../../../types';
import { PublisherModel } from './publisherModel';

export class PublisherList extends D1ListEndpoint<HandleArgs> {
  _meta = {
    model: PublisherModel
  };

  searchFields = ['name', 'unsignedName', 'description'];
  defaultOrderBy = 'id DESC';

  async before(filters: any) {
    filters.filters.push({ field: 'deleted', operator: '=', value: 0 });
    return filters;
  }
}

export class PublisherCreate extends D1CreateEndpoint<HandleArgs> {
  _meta = {
    model: PublisherModel,
    fields: PublisherModel.schema.pick({
      name: true,
      unsignedName: true,
      description: true
    })
  };
}

export class PublisherRead extends D1ReadEndpoint<HandleArgs> {
  _meta = {
    model: PublisherModel
  };

  async before(filters: any) {
    filters.filters.push({ field: 'deleted', operator: '=', value: 0 });
    return filters;
  }
}

export class PublisherUpdate extends D1UpdateEndpoint<HandleArgs> {
  _meta = {
    model: PublisherModel,
    fields: PublisherModel.schema.pick({
      name: true,
      unsignedName: true,
      description: true,
      deleted: true
    })
  };
}

export class PublisherDelete extends D1DeleteEndpoint<HandleArgs> {
  _meta = {
    model: PublisherModel
  };

  async handle(c: AppContext) {
    const { params } = await this.getValidatedData<any>();
    const db = c.env.DB;

    await db
      .prepare(
        `UPDATE ${PublisherModel.tableName} SET deleted = 1 WHERE id = ?`
      )
      .bind(params.id)
      .run();

    return {
      success: true,
      result: { id: params.id }
    };
  }
}

