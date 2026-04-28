import { ApiException, D1CreateEndpoint, D1DeleteEndpoint, D1ListEndpoint, D1ReadEndpoint, D1UpdateEndpoint } from 'chanfana';
import { AppContext, HandleArgs } from '../../../types';
import { checkDuplicate } from '../../../utils/db';
import { ClassModel } from './classModel';

export class ClassList extends D1ListEndpoint<HandleArgs> {
  _meta = {
    model: ClassModel
  };

  searchFields = ['name', 'unsignedName', 'description'];
  defaultOrderBy = 'id DESC';

  async before(filters: any) {
    filters.filters.push({ field: 'deleted', operator: '=', value: 0 });
    return filters;
  }
}

export class ClassCreate extends D1CreateEndpoint<HandleArgs> {
  _meta = {
    model: ClassModel,
    fields: ClassModel.schema.pick({
      name: true,
      unsignedName: true,
      description: true,
      publisherId: true
    })
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<any>();
    const body = data.body;
    const db = c.env.DB;

    if (body.unsignedName) {
      const existing = await checkDuplicate(
        db,
        ClassModel.tableName,
        body.unsignedName,
        {
          column: 'publisherId',
          value: body.publisherId
        }
      );
      if (existing) {
        const error = new ApiException('Class already exists');
        error.status = 409;
        throw error;
      }
    }

    const cleanBody = Object.fromEntries(Object.entries(body).filter(([_, v]) => v !== undefined));
    const result = await this.create(cleanBody);
 
    return c.json(
      {
        success: true,
        result: ClassModel.serializer(result)
      },
      201
    );
  }
}

export class ClassRead extends D1ReadEndpoint<HandleArgs> {
  _meta = {
    model: ClassModel
  };

  async before(filters: any) {
    filters.filters.push({ field: 'deleted', operator: '=', value: 0 });
    return filters;
  }
}

export class ClassUpdate extends D1UpdateEndpoint<HandleArgs> {
  _meta = {
    model: ClassModel,
    fields: ClassModel.schema.pick({
      name: true,
      unsignedName: true,
      description: true,
      deleted: true,
      publisherId: true
    })
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<any>();
    const { params, body } = data;
    const db = c.env.DB;

    if (body.unsignedName || body.publisherId) {
      let publisherId = body.publisherId;
      let unsignedName = body.unsignedName;

      // If either is missing, fetch current values
      if (publisherId === undefined || unsignedName === undefined) {
        const current = await db
          .prepare(`SELECT unsignedName, publisherId FROM ${ClassModel.tableName} WHERE id = ?`)
          .bind(params.id)
          .first<any>();

        if (publisherId === undefined) publisherId = current?.publisherId;
        if (unsignedName === undefined) unsignedName = current?.unsignedName;
      }

      const existing = await checkDuplicate(db, ClassModel.tableName, unsignedName, {
        column: 'publisherId',
        value: publisherId
      });

      if (existing && existing.id !== params.id) {
        const error = new ApiException('Class already exists');
        error.status = 409;
        throw error;
      }
    }

    // Manual Update
    const keys = Object.keys(body);
    if (keys.length > 0) {
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      const values = keys.map(k => (typeof body[k] === 'boolean' ? (body[k] ? 1 : 0) : body[k]));
      await db.prepare(`UPDATE ${ClassModel.tableName} SET ${setClause} WHERE id = ?`)
        .bind(...values, params.id)
        .run();
    }

    const updated = await db.prepare(`SELECT * FROM ${ClassModel.tableName} WHERE id = ?`)
      .bind(params.id)
      .first();

    return {
      success: true,
      result: ClassModel.serializer(updated)
    };
  }
}

export class ClassDelete extends D1DeleteEndpoint<HandleArgs> {
  _meta = {
    model: ClassModel
  };

  async handle(c: AppContext) {
    const { params } = await this.getValidatedData<any>();
    const db = c.env.DB;

    await db
      .prepare(`UPDATE ${ClassModel.tableName} SET deleted = 1 WHERE id = ?`)
      .bind(params.id)
      .run();

    return {
      success: true,
      result: { id: params.id }
    };
  }
}
