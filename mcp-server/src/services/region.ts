import { DatabaseService } from './database.js';

export interface Region {
  id: string;
  name: string;
  code: string;
  type: 'country' | 'state' | 'city' | 'district';
  parent_id?: string;
  population?: number;
  area_km2?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  created_at: Date;
  updated_at: Date;
}

interface DatabaseRegionRow {
  id: string;
  name: string;
  code: string;
  type: 'country' | 'state' | 'city' | 'district';
  parent_id?: string;
  population?: number;
  area_km2?: number;
  longitude?: string;
  latitude?: string;
  created_at: Date;
  updated_at: Date;
  distance_km?: number;
}

export interface RegionWithChildren extends Region {
  children?: Region[];
}

export class RegionService {
  constructor(private dbService: DatabaseService) {}

  private mapRowToRegion(row: DatabaseRegionRow): Region {
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      type: row.type,
      parent_id: row.parent_id,
      population: row.population,
      area_km2: row.area_km2,
      coordinates: row.longitude && row.latitude ? {
        longitude: parseFloat(row.longitude),
        latitude: parseFloat(row.latitude)
      } : undefined,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  async getRegions(limit: number = 50, offset: number = 0): Promise<Region[]> {
    try {
      const result = await this.dbService.query(
        `SELECT id, name, code, type, parent_id, population, area_km2, 
                ST_X(coordinates::geometry) as longitude, 
                ST_Y(coordinates::geometry) as latitude,
                created_at, updated_at 
         FROM regions 
         ORDER BY name ASC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      return result.rows.map((row: DatabaseRegionRow) => this.mapRowToRegion(row));
    } catch (error) {
      console.error('[Region Service] Get regions failed:', error);
      throw new Error('فشل في استرجاع قائمة المناطق');
    }
  }

  async getRegionById(id: string): Promise<Region | null> {
    try {
      const result = await this.dbService.query(
        `SELECT id, name, code, type, parent_id, population, area_km2, 
                ST_X(coordinates::geometry) as longitude, 
                ST_Y(coordinates::geometry) as latitude,
                created_at, updated_at 
         FROM regions 
         WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return this.mapRowToRegion(row);
    } catch (error) {
      console.error('[Region Service] Get region by ID failed:', error);
      throw new Error('فشل في استرجاع تفاصيل المنطقة');
    }
  }

  async getRegionByCode(code: string): Promise<Region | null> {
    try {
      const result = await this.dbService.query(
        `SELECT id, name, code, type, parent_id, population, area_km2, 
                ST_X(coordinates::geometry) as longitude, 
                ST_Y(coordinates::geometry) as latitude,
                created_at, updated_at 
         FROM regions 
         WHERE LOWER(code) = LOWER($1)`,
        [code]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return this.mapRowToRegion(row);
    } catch (error) {
      console.error('[Region Service] Get region by code failed:', error);
      throw new Error('فشل في البحث عن المنطقة');
    }
  }

  async createRegion(regionData: {
    name: string;
    code: string;
    type: 'country' | 'state' | 'city' | 'district';
    parent_id?: string;
    population?: number;
    area_km2?: number;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  }): Promise<Region> {
    try {
      // Check if region code already exists
      const existingRegion = await this.getRegionByCode(regionData.code);
      if (existingRegion) {
        throw new Error('منطقة بهذا الرمز موجودة بالفعل');
      }

      // Validate parent region if provided
      if (regionData.parent_id) {
        const parentRegion = await this.getRegionById(regionData.parent_id);
        if (!parentRegion) {
          throw new Error('المنطقة الأب غير موجودة');
        }
      }

      let query: string;
      let values: any[];

      if (regionData.coordinates) {
        query = `INSERT INTO regions (name, code, type, parent_id, population, area_km2, coordinates) 
                 VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8), 4326)) 
                 RETURNING id, name, code, type, parent_id, population, area_km2, 
                          ST_X(coordinates::geometry) as longitude, 
                          ST_Y(coordinates::geometry) as latitude,
                          created_at, updated_at`;
        values = [
          regionData.name,
          regionData.code,
          regionData.type,
          regionData.parent_id || null,
          regionData.population || null,
          regionData.area_km2 || null,
          regionData.coordinates.longitude,
          regionData.coordinates.latitude
        ];
      } else {
        query = `INSERT INTO regions (name, code, type, parent_id, population, area_km2) 
                 VALUES ($1, $2, $3, $4, $5, $6) 
                 RETURNING id, name, code, type, parent_id, population, area_km2, 
                          ST_X(coordinates::geometry) as longitude, 
                          ST_Y(coordinates::geometry) as latitude,
                          created_at, updated_at`;
        values = [
          regionData.name,
          regionData.code,
          regionData.type,
          regionData.parent_id || null,
          regionData.population || null,
          regionData.area_km2 || null
        ];
      }

      const result = await this.dbService.query(query, values);
      const row = result.rows[0];

      return {
        id: row.id,
        name: row.name,
        code: row.code,
        type: row.type,
        parent_id: row.parent_id,
        population: row.population,
        area_km2: row.area_km2,
        coordinates: row.longitude && row.latitude ? {
          longitude: parseFloat(row.longitude),
          latitude: parseFloat(row.latitude)
        } : undefined,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } catch (error) {
      console.error('[Region Service] Create region failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('فشل في إنشاء المنطقة');
    }
  }

  async updateRegion(
    id: string,
    updateData: Partial<{
      name: string;
      code: string;
      type: 'country' | 'state' | 'city' | 'district';
      parent_id: string;
      population: number;
      area_km2: number;
      coordinates: {
        latitude: number;
        longitude: number;
      };
    }>
  ): Promise<Region | null> {
    try {
      const setParts: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updateData.name !== undefined) {
        setParts.push(`name = $${paramIndex++}`);
        values.push(updateData.name);
      }

      if (updateData.code !== undefined) {
        setParts.push(`code = $${paramIndex++}`);
        values.push(updateData.code);
      }

      if (updateData.type !== undefined) {
        setParts.push(`type = $${paramIndex++}`);
        values.push(updateData.type);
      }

      if (updateData.parent_id !== undefined) {
        setParts.push(`parent_id = $${paramIndex++}`);
        values.push(updateData.parent_id);
      }

      if (updateData.population !== undefined) {
        setParts.push(`population = $${paramIndex++}`);
        values.push(updateData.population);
      }

      if (updateData.area_km2 !== undefined) {
        setParts.push(`area_km2 = $${paramIndex++}`);
        values.push(updateData.area_km2);
      }

      if (updateData.coordinates !== undefined) {
        setParts.push(`coordinates = ST_SetSRID(ST_MakePoint($${paramIndex++}, $${paramIndex++}), 4326)`);
        values.push(updateData.coordinates.longitude, updateData.coordinates.latitude);
      }

      if (setParts.length === 0) {
        throw new Error('لا توجد بيانات للتحديث');
      }

      setParts.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await this.dbService.query(
        `UPDATE regions SET ${setParts.join(', ')} 
         WHERE id = $${paramIndex} 
         RETURNING id, name, code, type, parent_id, population, area_km2, 
                  ST_X(coordinates::geometry) as longitude, 
                  ST_Y(coordinates::geometry) as latitude,
                  created_at, updated_at`,
        values
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        code: row.code,
        type: row.type,
        parent_id: row.parent_id,
        population: row.population,
        area_km2: row.area_km2,
        coordinates: row.longitude && row.latitude ? {
          longitude: parseFloat(row.longitude),
          latitude: parseFloat(row.latitude)
        } : undefined,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } catch (error) {
      console.error('[Region Service] Update region failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('فشل في تحديث المنطقة');
    }
  }

  async deleteRegion(id: string): Promise<boolean> {
    try {
      // Check if region has children
      const childrenResult = await this.dbService.query(
        'SELECT COUNT(*) as count FROM regions WHERE parent_id = $1',
        [id]
      );

      if (parseInt(childrenResult.rows[0].count) > 0) {
        throw new Error('لا يمكن حذف منطقة تحتوي على مناطق فرعية');
      }

      const result = await this.dbService.query(
        'DELETE FROM regions WHERE id = $1',
        [id]
      );

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('[Region Service] Delete region failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('فشل في حذف المنطقة');
    }
  }

  async searchRegions(searchTerm: string, limit: number = 20): Promise<Region[]> {
    try {
      const result = await this.dbService.query(
        `SELECT id, name, code, type, parent_id, population, area_km2, 
                ST_X(coordinates::geometry) as longitude, 
                ST_Y(coordinates::geometry) as latitude,
                created_at, updated_at 
         FROM regions 
         WHERE LOWER(name) LIKE LOWER($1) 
            OR LOWER(code) LIKE LOWER($1) 
         ORDER BY 
           CASE WHEN LOWER(name) LIKE LOWER($1) THEN 1 ELSE 2 END,
           name ASC 
         LIMIT $2`,
        [`%${searchTerm}%`, limit]
      );

      return result.rows.map((row: DatabaseRegionRow) => this.mapRowToRegion(row));
    } catch (error: unknown) {
      console.error('[Region Service] Search regions failed:', error);
      throw new Error('فشل في البحث عن المناطق');
    }
  }

  async getRegionsByType(type: 'country' | 'state' | 'city' | 'district'): Promise<Region[]> {
    try {
      const result = await this.dbService.query(
        `SELECT id, name, code, type, parent_id, population, area_km2, 
                ST_X(coordinates::geometry) as longitude, 
                ST_Y(coordinates::geometry) as latitude,
                created_at, updated_at 
         FROM regions 
         WHERE type = $1 
         ORDER BY name ASC`,
        [type]
      );

      return result.rows.map((row: DatabaseRegionRow) => this.mapRowToRegion(row));
    } catch (error: unknown) {
      console.error('[Region Service] Get regions by type failed:', error);
      throw new Error('فشل في استرجاع المناطق حسب النوع');
    }
  }

  async getRegionChildren(parentId: string): Promise<Region[]> {
    try {
      const result = await this.dbService.query(
        `SELECT id, name, code, type, parent_id, population, area_km2, 
                ST_X(coordinates::geometry) as longitude, 
                ST_Y(coordinates::geometry) as latitude,
                created_at, updated_at 
         FROM regions 
         WHERE parent_id = $1 
         ORDER BY name ASC`,
        [parentId]
      );

      return result.rows.map((row: DatabaseRegionRow) => this.mapRowToRegion(row));
    } catch (error) {
      console.error('[Region Service] Get region children failed:', error);
      throw new Error('فشل في استرجاع المناطق الفرعية');
    }
  }

  async getRegionHierarchy(regionId: string): Promise<RegionWithChildren | null> {
    try {
      const region = await this.getRegionById(regionId);
      if (!region) {
        return null;
      }

      const children = await this.getRegionChildren(regionId);
      
      return {
        ...region,
        children
      };
    } catch (error) {
      console.error('[Region Service] Get region hierarchy failed:', error);
      throw new Error('فشل في استرجاع التسلسل الهرمي للمنطقة');
    }
  }

  async getRegionsNearby(
    latitude: number,
    longitude: number,
    radiusKm: number = 50,
    limit: number = 10
  ): Promise<Region[]> {
    try {
      const result = await this.dbService.query(
        `SELECT id, name, code, type, parent_id, population, area_km2, 
                ST_X(coordinates::geometry) as longitude, 
                ST_Y(coordinates::geometry) as latitude,
                created_at, updated_at,
                ST_Distance(
                  coordinates::geography,
                  ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
                ) / 1000 as distance_km
         FROM regions 
         WHERE coordinates IS NOT NULL
           AND ST_DWithin(
             coordinates::geography,
             ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
             $3 * 1000
           )
         ORDER BY distance_km ASC 
         LIMIT $4`,
        [longitude, latitude, radiusKm, limit]
      );

      return result.rows.map((row: DatabaseRegionRow) => this.mapRowToRegion(row));
    } catch (error: unknown) {
      console.error('[Region Service] Get nearby regions failed:', error);
      throw new Error('فشل في البحث عن المناطق المجاورة');
    }
  }
}