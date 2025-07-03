import { Pool } from "pg"

// إعداد اتصال قاعدة البيانات
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

export class Database {
  // تنفيذ استعلام SQL
  static async query(text: string, params?: any[]): Promise<any> {
    const client = await pool.connect()
    try {
      const result = await client.query(text, params)
      return result
    } finally {
      client.release()
    }
  }

  // تنفيذ معاملة (Transaction)
  static async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await pool.connect()
    try {
      await client.query("BEGIN")
      const result = await callback(client)
      await client.query("COMMIT")
      return result
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  }

  // إغلاق الاتصال
  static async close(): Promise<void> {
    await pool.end()
  }
}

// أدوات مساعدة لبناء الاستعلامات
export class QueryBuilder {
  // بناء استعلام SELECT مع pagination
  static buildSelectQuery(
    table: string,
    columns: string[] = ["*"],
    where?: string,
    orderBy?: string,
    limit?: number,
    offset?: number,
  ): string {
    let query = `SELECT ${columns.join(", ")} FROM ${table}`

    if (where) {
      query += ` WHERE ${where}`
    }

    if (orderBy) {
      query += ` ORDER BY ${orderBy}`
    }

    if (limit) {
      query += ` LIMIT ${limit}`
    }

    if (offset) {
      query += ` OFFSET ${offset}`
    }

    return query
  }

  // بناء استعلام INSERT
  static buildInsertQuery(table: string, data: Record<string, any>): { query: string; values: any[] } {
    const columns = Object.keys(data)
    const placeholders = columns.map((_, index) => `$${index + 1}`)
    const values = Object.values(data)

    const query = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`

    return { query, values }
  }

  // بناء استعلام UPDATE
  static buildUpdateQuery(
    table: string,
    data: Record<string, any>,
    whereClause: string,
    whereValues: any[],
  ): { query: string; values: any[] } {
    const columns = Object.keys(data)
    const setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(", ")
    const values = [...Object.values(data), ...whereValues]

    const query = `UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE ${whereClause} RETURNING *`

    return { query, values }
  }

  // بناء استعلام DELETE
  static buildDeleteQuery(table: string, whereClause: string): string {
    return `DELETE FROM ${table} WHERE ${whereClause}`
  }
}
