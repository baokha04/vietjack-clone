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
import { SubjectModel } from './subjectModel';

export class SubjectList extends D1ListEndpoint<HandleArgs> {
  _meta = {
    model: SubjectModel
  };

  searchFields = ['name', 'unsignedName', 'description'];
  defaultOrderBy = 'id DESC';

  async before(filters: any) {
    filters.filters.push({ field: 'deleted', operator: '=', value: 0 });
    return filters;
  }
}

export class SubjectCreate extends D1CreateEndpoint<HandleArgs> {
  _meta = {
    model: SubjectModel,
    fields: SubjectModel.schema.pick({
      name: true,
      unsignedName: true,
      description: true,
      classId: true
    })
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<any>();
    const body = data.body;
    const db = c.env.DB;

    if (body.unsignedName) {
      const existing = await checkDuplicate(
        db,
        SubjectModel.tableName,
        body.unsignedName,
        {
          column: 'classId',
          value: body.classId
        }
      );
      if (existing) {
        const error = new ApiException('Subject already exists');
        error.status = 409;
        throw error;
      }
    }

    const cleanBody = Object.fromEntries(Object.entries(body).filter(([_, v]) => v !== undefined));
    const result = await this.create(cleanBody);
 
    return c.json(
      {
        success: true,
        result: SubjectModel.serializer(result)
      },
      201
    );
  }
}

export class SubjectRead extends D1ReadEndpoint<HandleArgs> {
  _meta = {
    model: SubjectModel
  };

  async before(filters: any) {
    filters.filters.push({ field: 'deleted', operator: '=', value: 0 });
    return filters;
  }
}

export class SubjectUpdate extends D1UpdateEndpoint<HandleArgs> {
  _meta = {
    model: SubjectModel,
    fields: SubjectModel.schema.pick({
      name: true,
      unsignedName: true,
      description: true,
      deleted: true,
      classId: true
    })
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<any>();
    const { params, body } = data;
    const db = c.env.DB;

    if (body.unsignedName || body.classId) {
      let classId = body.classId;
      let unsignedName = body.unsignedName;

      // If either is missing, fetch current values
      if (classId === undefined || unsignedName === undefined) {
        const current = await db
          .prepare(`SELECT unsignedName, classId FROM ${SubjectModel.tableName} WHERE id = ?`)
          .bind(params.id)
          .first<any>();

        if (classId === undefined) classId = current?.classId;
        if (unsignedName === undefined) unsignedName = current?.unsignedName;
      }

      const existing = await checkDuplicate(db, SubjectModel.tableName, unsignedName, {
        column: 'classId',
        value: classId
      });

      if (existing && existing.id !== params.id) {
        const error = new ApiException('Subject already exists');
        error.status = 409;
        throw error;
      }
    }

    // Manual Update
    const keys = Object.keys(body);
    if (keys.length > 0) {
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      const values = keys.map(k => (typeof body[k] === 'boolean' ? (body[k] ? 1 : 0) : body[k]));
      await db.prepare(`UPDATE ${SubjectModel.tableName} SET ${setClause} WHERE id = ?`)
        .bind(...values, params.id)
        .run();
    }

    const updated = await db.prepare(`SELECT * FROM ${SubjectModel.tableName} WHERE id = ?`)
      .bind(params.id)
      .first();

    return {
      success: true,
      result: SubjectModel.serializer(updated)
    };
  }
}

export class SubjectDelete extends D1DeleteEndpoint<HandleArgs> {
  _meta = {
    model: SubjectModel
  };

  async handle(c: AppContext) {
    const { params } = await this.getValidatedData<any>();
    const db = c.env.DB;

    await db
      .prepare(`UPDATE ${SubjectModel.tableName} SET deleted = 1 WHERE id = ?`)
      .bind(params.id)
      .run();

    return {
      success: true,
      result: { id: params.id }
    };
  }
}

