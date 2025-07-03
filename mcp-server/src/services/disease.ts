import { DatabaseService } from './database.js';

export interface Disease {
  id: string;
  name: string;
  description: string;
  symptoms?: string[];
  prevention_measures?: string[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  created_at: Date;
  updated_at: Date;
}

interface DatabaseRow {
  id: string;
  name: string;
  description: string;
  symptoms: string | string[];
  prevention_measures: string | string[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  created_at: Date;
  updated_at: Date;
}

export interface DiseaseStatistics {
  total_diseases: number;
  total_regions: number;
  total_surveys: number;
  high_risk_diseases: number;
  recent_cases: number;
  active_outbreaks: number;
}

export class DiseaseService {
  constructor(private dbService: DatabaseService) {}

  private mapRowToDisease(row: DatabaseRow): Disease {
    return {
      ...row,
      symptoms: Array.isArray(row.symptoms) ? row.symptoms : JSON.parse(row.symptoms || '[]'),
      prevention_measures: Array.isArray(row.prevention_measures) ? row.prevention_measures : JSON.parse(row.prevention_measures || '[]')
    };
  }

  async getDiseases(limit: number = 10, offset: number = 0): Promise<Disease[]> {
    try {
      const result = await this.dbService.query(
        `SELECT id, name, description, symptoms, prevention_measures, risk_level, created_at, updated_at 
         FROM diseases 
         ORDER BY created_at DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      return result.rows.map((row: DatabaseRow) => this.mapRowToDisease(row));
    } catch (error) {
      console.error('[Disease Service] Get diseases failed:', error);
      throw new Error('فشل في استرجاع قائمة الأمراض');
    }
  }

  async getDiseaseById(id: string): Promise<Disease | null> {
    try {
      const result = await this.dbService.query(
        `SELECT id, name, description, symptoms, prevention_measures, risk_level, created_at, updated_at 
         FROM diseases 
         WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row: DatabaseRow = result.rows[0];
      return this.mapRowToDisease(row);
    } catch (error) {
      console.error('[Disease Service] Get disease by ID failed:', error);
      throw new Error('فشل في استرجاع تفاصيل المرض');
    }
  }

  async getDiseaseByName(name: string): Promise<Disease | null> {
    try {
      const result = await this.dbService.query(
        `SELECT id, name, description, symptoms, prevention_measures, risk_level, created_at, updated_at 
         FROM diseases 
         WHERE LOWER(name) = LOWER($1)`,
        [name]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row: DatabaseRow = result.rows[0];
      return this.mapRowToDisease(row);
    } catch (error) {
      console.error('[Disease Service] Get disease by name failed:', error);
      throw new Error('فشل في البحث عن المرض');
    }
  }

  async createDisease(diseaseData: {
    name: string;
    description: string;
    symptoms?: string[];
    prevention_measures?: string[];
    risk_level: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<Disease> {
    try {
      // Check if disease already exists
      const existingDisease = await this.getDiseaseByName(diseaseData.name);
      if (existingDisease) {
        throw new Error('مرض بهذا الاسم موجود بالفعل');
      }

      const result = await this.dbService.query(
        `INSERT INTO diseases (name, description, symptoms, prevention_measures, risk_level) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, name, description, symptoms, prevention_measures, risk_level, created_at, updated_at`,
        [
          diseaseData.name,
          diseaseData.description,
          JSON.stringify(diseaseData.symptoms || []),
          JSON.stringify(diseaseData.prevention_measures || []),
          diseaseData.risk_level
        ]
      );

      const row: DatabaseRow = result.rows[0];
      return this.mapRowToDisease(row);
    } catch (error) {
      console.error('[Disease Service] Create disease failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('فشل في إنشاء المرض');
    }
  }

  async updateDisease(
    id: string,
    updateData: Partial<{
      name: string;
      description: string;
      symptoms: string[];
      prevention_measures: string[];
      risk_level: 'low' | 'medium' | 'high' | 'critical';
    }>
  ): Promise<Disease | null> {
    try {
      const setParts: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updateData.name !== undefined) {
        setParts.push(`name = $${paramIndex++}`);
        values.push(updateData.name);
      }

      if (updateData.description !== undefined) {
        setParts.push(`description = $${paramIndex++}`);
        values.push(updateData.description);
      }

      if (updateData.symptoms !== undefined) {
        setParts.push(`symptoms = $${paramIndex++}`);
        values.push(JSON.stringify(updateData.symptoms));
      }

      if (updateData.prevention_measures !== undefined) {
        setParts.push(`prevention_measures = $${paramIndex++}`);
        values.push(JSON.stringify(updateData.prevention_measures));
      }

      if (updateData.risk_level !== undefined) {
        setParts.push(`risk_level = $${paramIndex++}`);
        values.push(updateData.risk_level);
      }

      if (setParts.length === 0) {
        throw new Error('لا توجد بيانات للتحديث');
      }

      setParts.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await this.dbService.query(
        `UPDATE diseases SET ${setParts.join(', ')} 
         WHERE id = $${paramIndex} 
         RETURNING id, name, description, symptoms, prevention_measures, risk_level, created_at, updated_at`,
        values
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row: DatabaseRow = result.rows[0];
      return this.mapRowToDisease(row);
    } catch (error) {
      console.error('[Disease Service] Update disease failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('فشل في تحديث المرض');
    }
  }

  async deleteDisease(id: string): Promise<boolean> {
    try {
      const result = await this.dbService.query(
        'DELETE FROM diseases WHERE id = $1',
        [id]
      );

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('[Disease Service] Delete disease failed:', error);
      throw new Error('فشل في حذف المرض');
    }
  }

  async searchDiseases(searchTerm: string, limit: number = 10): Promise<Disease[]> {
    try {
      const result = await this.dbService.query(
        `SELECT id, name, description, symptoms, prevention_measures, risk_level, created_at, updated_at 
         FROM diseases 
         WHERE LOWER(name) LIKE LOWER($1) 
            OR LOWER(description) LIKE LOWER($1) 
         ORDER BY 
           CASE WHEN LOWER(name) LIKE LOWER($1) THEN 1 ELSE 2 END,
           created_at DESC 
         LIMIT $2`,
        [`%${searchTerm}%`, limit]
      );

      return result.rows.map((row: DatabaseRow) => this.mapRowToDisease(row));
    } catch (error) {
      console.error('[Disease Service] Search diseases failed:', error);
      throw new Error('فشل في البحث عن الأمراض');
    }
  }

  async getDiseasesByRiskLevel(riskLevel: 'low' | 'medium' | 'high' | 'critical'): Promise<Disease[]> {
    try {
      const result = await this.dbService.query(
        `SELECT id, name, description, symptoms, prevention_measures, risk_level, created_at, updated_at 
         FROM diseases 
         WHERE risk_level = $1 
         ORDER BY created_at DESC`,
        [riskLevel]
      );

      return result.rows.map((row: DatabaseRow) => this.mapRowToDisease(row));
    } catch (error) {
      console.error('[Disease Service] Get diseases by risk level failed:', error);
      throw new Error('فشل في استرجاع الأمراض حسب مستوى الخطر');
    }
  }

  async getStatistics(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<DiseaseStatistics> {
    try {
      const periodCondition = this.getPeriodCondition(period);

      const [diseasesResult, regionsResult, surveysResult, highRiskResult] = await Promise.all([
        this.dbService.query('SELECT COUNT(*) as count FROM diseases'),
        this.dbService.query('SELECT COUNT(*) as count FROM regions'),
        this.dbService.query(`SELECT COUNT(*) as count FROM surveys WHERE created_at >= ${periodCondition}`),
        this.dbService.query("SELECT COUNT(*) as count FROM diseases WHERE risk_level IN ('high', 'critical')")
      ]);

      return {
        total_diseases: parseInt(diseasesResult.rows[0].count),
        total_regions: parseInt(regionsResult.rows[0].count),
        total_surveys: parseInt(surveysResult.rows[0].count),
        high_risk_diseases: parseInt(highRiskResult.rows[0].count),
        recent_cases: 0, // This would need a cases table
        active_outbreaks: 0 // This would need an outbreaks table
      };
    } catch (error) {
      console.error('[Disease Service] Get statistics failed:', error);
      throw new Error('فشل في استرجاع الإحصائيات');
    }
  }

  private getPeriodCondition(period: string): string {
    switch (period) {
      case 'week':
        return "NOW() - INTERVAL '7 days'";
      case 'month':
        return "NOW() - INTERVAL '30 days'";
      case 'quarter':
        return "NOW() - INTERVAL '90 days'";
      case 'year':
        return "NOW() - INTERVAL '365 days'";
      default:
        return "NOW() - INTERVAL '30 days'";
    }
  }
}