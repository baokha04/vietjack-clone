import {
  ApiException,
  D1CreateEndpoint,
  D1DeleteEndpoint,
  D1ListEndpoint,
  D1ReadEndpoint,
  D1UpdateEndpoint
} from 'chanfana';
import { AppContext, HandleArgs } from '../../../types';
import { checkDuplicate } from '../../../utils/db';
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

  async handle(c: AppContext) {
    const data = await this.getValidatedData<any>();
    const body = data.body;
    const db = c.env.DB;

    if (body.unsignedName) {
      const existing = await checkDuplicate(
        db,
        PublisherModel.tableName,
        body.unsignedName
      );
      if (existing) {
        const error = new ApiException('Publisher already exists');
        error.status = 409;
        throw error;
      }
    }

    const cleanBody = Object.fromEntries(Object.entries(body).filter(([_, v]) => v !== undefined));
    const publisherResult = await this.create(cleanBody);
 
    return c.json(
      {
        success: true,
        result: PublisherModel.serializer(publisherResult)
      },
      201
    );
  }
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

  async handle(c: AppContext) {
    const data = await this.getValidatedData<any>();
    const { params, body } = data;
    const db = c.env.DB;

    if (body.unsignedName) {
      const existing = await checkDuplicate(
        db,
        PublisherModel.tableName,
        body.unsignedName
      );

      if (existing && existing.id !== params.id) {
        const error = new ApiException('Publisher already exists');
        error.status = 409;
        throw error;
      }
    }

    // Manual Update
    const keys = Object.keys(body);
    if (keys.length > 0) {
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      const values = keys.map(k => (typeof body[k] === 'boolean' ? (body[k] ? 1 : 0) : body[k]));
      await db.prepare(`UPDATE ${PublisherModel.tableName} SET ${setClause} WHERE id = ?`)
        .bind(...values, params.id)
        .run();
    }

    const updated = await db.prepare(`SELECT * FROM ${PublisherModel.tableName} WHERE id = ?`)
      .bind(params.id)
      .first();

    return {
      success: true,
      result: PublisherModel.serializer(updated)
    };
  }
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

