import { D1CreateEndpoint, D1DeleteEndpoint, D1ListEndpoint, D1ReadEndpoint, D1UpdateEndpoint } from 'chanfana';
import { AppContext, HandleArgs } from '../../../types';
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
