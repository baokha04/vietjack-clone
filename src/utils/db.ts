export async function checkDuplicate(
  db: D1Database,
  tableName: string,
  unsignedName?: string,
  reference?: { column: string; value: number }
): Promise<{ id: number } | null> {
  if (!unsignedName) return null;

  let query = `SELECT id FROM ${tableName} WHERE unsignedName = ? AND deleted = 0`;
  const params: (string | number)[] = [unsignedName];

  if (reference) {
    query += ` AND ${reference.column} = ?`;
    params.push(reference.value);
  }

  return await db.prepare(query).bind(...params).first<{ id: number }>();
}
