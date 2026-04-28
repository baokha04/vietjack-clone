import { D1CreateEndpoint, D1DeleteEndpoint, D1ListEndpoint, D1ReadEndpoint, D1UpdateEndpoint } from 'chanfana';
import { AppContext, HandleArgs } from '../../../types';
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
