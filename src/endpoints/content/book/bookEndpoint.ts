import { ApiException, D1CreateEndpoint, D1DeleteEndpoint, D1ListEndpoint, D1ReadEndpoint, D1UpdateEndpoint } from 'chanfana';
import { AppContext, HandleArgs } from '../../../types';
import { checkDuplicate } from '../../../utils/db';
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

  async handle(c: AppContext) {
    const data = await this.getValidatedData<any>();
    const body = data.body;
    const db = c.env.DB;

    if (body.unsignedName) {
      const existing = await checkDuplicate(db, BookModel.tableName, body.unsignedName, {
        column: 'subjectId',
        value: body.subjectId
      });
      if (existing) {
        const error = new ApiException('Book already exists');
        error.status = 409;
        throw error;
      }
    }

    const cleanBody = Object.fromEntries(Object.entries(body).filter(([_, v]) => v !== undefined));
    const result = await this.create(cleanBody);
 
    return c.json(
      {
        success: true,
        result: BookModel.serializer(result)
      },
      201
    );
  }
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

  async handle(c: AppContext) {
    const data = await this.getValidatedData<any>();
    const { params, body } = data;
    const db = c.env.DB;

    if (body.unsignedName || body.subjectId) {
      let subjectId = body.subjectId;
      let unsignedName = body.unsignedName;

      // If either is missing, fetch current values
      if (subjectId === undefined || unsignedName === undefined) {
        const current = await db
          .prepare(`SELECT unsignedName, subjectId FROM ${BookModel.tableName} WHERE id = ?`)
          .bind(params.id)
          .first<any>();
        
        if (subjectId === undefined) subjectId = current?.subjectId;
        if (unsignedName === undefined) unsignedName = current?.unsignedName;
      }

      const existing = await checkDuplicate(db, BookModel.tableName, unsignedName, {
        column: 'subjectId',
        value: subjectId
      });

      if (existing && existing.id !== params.id) {
        const error = new ApiException('Book already exists');
        error.status = 409;
        throw error;
      }
    }

    // Manual Update
    const keys = Object.keys(body);
    if (keys.length > 0) {
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      const values = keys.map(k => (typeof body[k] === 'boolean' ? (body[k] ? 1 : 0) : body[k]));
      await db.prepare(`UPDATE ${BookModel.tableName} SET ${setClause} WHERE id = ?`)
        .bind(...values, params.id)
        .run();
    }

    const updated = await db.prepare(`SELECT * FROM ${BookModel.tableName} WHERE id = ?`)
      .bind(params.id)
      .first();

    return {
      success: true,
      result: BookModel.serializer(updated)
    };
  }
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
