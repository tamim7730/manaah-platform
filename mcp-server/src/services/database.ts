import { Pool, PoolClient, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export class DatabaseService {
  private pool: Pool;
  private isConnected: boolean = false;

  constructor() {
    this.pool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'manaah_platform',
      user: process.env.POSTGRES_USER || 'manaah_user',
      password: process.env.POSTGRES_PASSWORD || 'secure_password',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', (err: Error) => {
      console.error('[Database Pool Error]', err);
    });
  }

  async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      this.isConnected = true;
      console.log('[Database] Connection established successfully');
    } catch (error) {
      console.error('[Database] Connection failed:', error);
      throw error;
    }
  }

  async query(text: string, params?: any[]): Promise<QueryResult<any>> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const start = Date.now();
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      console.log('[Database Query]', {
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        duration: `${duration}ms`,
        rows: result.rowCount
      });
      
      return result;
    } catch (error: unknown) {
      console.error('[Database Query Error]', {
        query: text,
        params,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  async getClient(): Promise<PoolClient> {
    if (!this.isConnected) {
      await this.connect();
    }
    return this.pool.connect();
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    try {
      await this.pool.end();
      this.isConnected = false;
      console.log('[Database] Connection pool closed');
    } catch (error) {
      console.error('[Database] Error closing connection pool:', error);
      throw error;
    }
  }

  isHealthy(): boolean {
    return this.isConnected && this.pool.totalCount > 0;
  }

  getPoolStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount
    };
  }
}