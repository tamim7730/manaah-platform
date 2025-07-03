import { DatabaseService } from './database.js';

export interface Survey {
  id: string;
  title: string;
  description: string;
  disease_id?: string;
  region_id?: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  start_date: Date;
  end_date?: Date;
  questions: SurveyQuestion[];
  responses_count: number;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface SurveyQuestion {
  id: string;
  question: string;
  type: 'text' | 'number' | 'boolean' | 'multiple_choice' | 'single_choice';
  options?: string[];
  required: boolean;
  order: number;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  respondent_id?: string;
  answers: SurveyAnswer[];
  submitted_at: Date;
  ip_address?: string;
  user_agent?: string;
}

export interface SurveyAnswer {
  question_id: string;
  answer: string | number | boolean | string[];
}

export interface SurveyStatistics {
  total_surveys: number;
  active_surveys: number;
  completed_surveys: number;
  total_responses: number;
  average_responses_per_survey: number;
  completion_rate: number;
}

interface DatabaseSurveyRow {
  id: string;
  title: string;
  description: string;
  disease_id?: string;
  region_id?: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  start_date: Date;
  end_date?: Date;
  questions: string | SurveyQuestion[];
  responses_count: string | number;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

interface DatabaseSurveyResponseRow {
  id: string;
  survey_id: string;
  respondent_id?: string;
  answers: string | SurveyAnswer[];
  submitted_at: Date;
  ip_address?: string;
  user_agent?: string;
}

export class SurveyService {
  constructor(private dbService: DatabaseService) {}

  private mapRowToSurvey(row: DatabaseSurveyRow): Survey {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      disease_id: row.disease_id,
      region_id: row.region_id,
      status: row.status,
      start_date: row.start_date,
      end_date: row.end_date,
      questions: Array.isArray(row.questions) ? row.questions : JSON.parse(row.questions || '[]'),
      responses_count: typeof row.responses_count === 'string' ? parseInt(row.responses_count) || 0 : row.responses_count,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  private mapRowToSurveyResponse(row: DatabaseSurveyResponseRow): SurveyResponse {
    return {
      id: row.id,
      survey_id: row.survey_id,
      respondent_id: row.respondent_id,
      answers: Array.isArray(row.answers) ? row.answers : JSON.parse(row.answers || '[]'),
      submitted_at: row.submitted_at,
      ip_address: row.ip_address,
      user_agent: row.user_agent
    };
  }

  async getSurveys(
    limit: number = 20,
    offset: number = 0,
    status?: 'draft' | 'active' | 'completed' | 'cancelled'
  ): Promise<Survey[]> {
    try {
      let query = `
        SELECT s.id, s.title, s.description, s.disease_id, s.region_id, s.status, 
               s.start_date, s.end_date, s.questions, s.created_by, s.created_at, s.updated_at,
               COALESCE(r.response_count, 0) as responses_count
        FROM surveys s
        LEFT JOIN (
          SELECT survey_id, COUNT(*) as response_count
          FROM survey_responses
          GROUP BY survey_id
        ) r ON s.id = r.survey_id
      `;
      
      const values: any[] = [];
      let paramIndex = 1;

      if (status) {
        query += ` WHERE s.status = $${paramIndex++}`;
        values.push(status);
      }

      query += ` ORDER BY s.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      values.push(limit, offset);

      const result = await this.dbService.query(query, values);

      return result.rows.map((row: DatabaseSurveyRow) => this.mapRowToSurvey(row));
    } catch (error: unknown) {
      console.error('[Survey Service] Get surveys failed:', error);
      throw new Error('فشل في استرجاع قائمة الاستطلاعات');
    }
  }

  async getSurveyById(id: string): Promise<Survey | null> {
    try {
      const result = await this.dbService.query(
        `SELECT s.id, s.title, s.description, s.disease_id, s.region_id, s.status, 
                s.start_date, s.end_date, s.questions, s.created_by, s.created_at, s.updated_at,
                COALESCE(r.response_count, 0) as responses_count
         FROM surveys s
         LEFT JOIN (
           SELECT survey_id, COUNT(*) as response_count
           FROM survey_responses
           GROUP BY survey_id
         ) r ON s.id = r.survey_id
         WHERE s.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row: DatabaseSurveyRow = result.rows[0];
      return this.mapRowToSurvey(row);
    } catch (error: unknown) {
      console.error('[Survey Service] Get survey by ID failed:', error);
      throw new Error('فشل في استرجاع تفاصيل الاستطلاع');
    }
  }

  async createSurvey(surveyData: {
    title: string;
    description: string;
    disease_id?: string;
    region_id?: string;
    start_date: Date;
    end_date?: Date;
    questions: Omit<SurveyQuestion, 'id'>[];
    created_by: string;
  }): Promise<Survey> {
    try {
      // Generate question IDs and validate questions
      const questionsWithIds: SurveyQuestion[] = surveyData.questions.map((q, index) => ({
        id: `q_${Date.now()}_${index}`,
        ...q
      }));

      // Validate questions
      if (questionsWithIds.length === 0) {
        throw new Error('يجب أن يحتوي الاستطلاع على سؤال واحد على الأقل');
      }

      // Validate dates
      if (surveyData.end_date && surveyData.end_date <= surveyData.start_date) {
        throw new Error('تاريخ انتهاء الاستطلاع يجب أن يكون بعد تاريخ البداية');
      }

      const result = await this.dbService.query(
        `INSERT INTO surveys (title, description, disease_id, region_id, start_date, end_date, questions, created_by) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING id, title, description, disease_id, region_id, status, start_date, end_date, questions, created_by, created_at, updated_at`,
        [
          surveyData.title,
          surveyData.description,
          surveyData.disease_id || null,
          surveyData.region_id || null,
          surveyData.start_date,
          surveyData.end_date || null,
          JSON.stringify(questionsWithIds),
          surveyData.created_by
        ]
      );

      const row = result.rows[0];
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        disease_id: row.disease_id,
        region_id: row.region_id,
        status: row.status,
        start_date: row.start_date,
        end_date: row.end_date,
        questions: row.questions || [],
        responses_count: 0,
        created_by: row.created_by,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } catch (error) {
      console.error('[Survey Service] Create survey failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('فشل في إنشاء الاستطلاع');
    }
  }

  async updateSurvey(
    id: string,
    updateData: Partial<{
      title: string;
      description: string;
      disease_id: string;
      region_id: string;
      status: 'draft' | 'active' | 'completed' | 'cancelled';
      start_date: Date;
      end_date: Date;
      questions: SurveyQuestion[];
    }>
  ): Promise<Survey | null> {
    try {
      const setParts: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updateData.title !== undefined) {
        setParts.push(`title = $${paramIndex++}`);
        values.push(updateData.title);
      }

      if (updateData.description !== undefined) {
        setParts.push(`description = $${paramIndex++}`);
        values.push(updateData.description);
      }

      if (updateData.disease_id !== undefined) {
        setParts.push(`disease_id = $${paramIndex++}`);
        values.push(updateData.disease_id);
      }

      if (updateData.region_id !== undefined) {
        setParts.push(`region_id = $${paramIndex++}`);
        values.push(updateData.region_id);
      }

      if (updateData.status !== undefined) {
        setParts.push(`status = $${paramIndex++}`);
        values.push(updateData.status);
      }

      if (updateData.start_date !== undefined) {
        setParts.push(`start_date = $${paramIndex++}`);
        values.push(updateData.start_date);
      }

      if (updateData.end_date !== undefined) {
        setParts.push(`end_date = $${paramIndex++}`);
        values.push(updateData.end_date);
      }

      if (updateData.questions !== undefined) {
        setParts.push(`questions = $${paramIndex++}`);
        values.push(JSON.stringify(updateData.questions));
      }

      if (setParts.length === 0) {
        throw new Error('لا توجد بيانات للتحديث');
      }

      setParts.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await this.dbService.query(
        `UPDATE surveys SET ${setParts.join(', ')} 
         WHERE id = $${paramIndex} 
         RETURNING id, title, description, disease_id, region_id, status, start_date, end_date, questions, created_by, created_at, updated_at`,
        values
      );

      if (result.rows.length === 0) {
        return null;
      }

      // Get response count
      const responseResult = await this.dbService.query(
        'SELECT COUNT(*) as count FROM survey_responses WHERE survey_id = $1',
        [id]
      );

      const row = result.rows[0];
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        disease_id: row.disease_id,
        region_id: row.region_id,
        status: row.status,
        start_date: row.start_date,
        end_date: row.end_date,
        questions: row.questions || [],
        responses_count: parseInt(responseResult.rows[0].count) || 0,
        created_by: row.created_by,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } catch (error) {
      console.error('[Survey Service] Update survey failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('فشل في تحديث الاستطلاع');
    }
  }

  async deleteSurvey(id: string): Promise<boolean> {
    try {
      // Delete responses first (cascade)
      await this.dbService.query(
        'DELETE FROM survey_responses WHERE survey_id = $1',
        [id]
      );

      const result = await this.dbService.query(
        'DELETE FROM surveys WHERE id = $1',
        [id]
      );

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('[Survey Service] Delete survey failed:', error);
      throw new Error('فشل في حذف الاستطلاع');
    }
  }

  async searchSurveys(searchTerm: string, limit: number = 20): Promise<Survey[]> {
    try {
      const result = await this.dbService.query(
        `SELECT s.id, s.title, s.description, s.disease_id, s.region_id, s.status, 
                s.start_date, s.end_date, s.questions, s.created_by, s.created_at, s.updated_at,
                COALESCE(r.response_count, 0) as responses_count
         FROM surveys s
         LEFT JOIN (
           SELECT survey_id, COUNT(*) as response_count
           FROM survey_responses
           GROUP BY survey_id
         ) r ON s.id = r.survey_id
         WHERE s.title ILIKE $1 OR s.description ILIKE $1
         ORDER BY s.created_at DESC
         LIMIT $2`,
        [`%${searchTerm}%`, limit]
      );

      return result.rows.map((row: DatabaseSurveyRow) => this.mapRowToSurvey(row));
    } catch (error: unknown) {
      console.error('[Survey Service] Search surveys failed:', error);
      throw new Error('فشل في البحث عن الاستطلاعات');
    }
  }

  async getSurveysByDisease(diseaseId: string): Promise<Survey[]> {
    try {
      const result = await this.dbService.query(
        `SELECT s.id, s.title, s.description, s.disease_id, s.region_id, s.status, 
                s.start_date, s.end_date, s.questions, s.created_by, s.created_at, s.updated_at,
                COALESCE(r.response_count, 0) as responses_count
         FROM surveys s
         LEFT JOIN (
           SELECT survey_id, COUNT(*) as response_count
           FROM survey_responses
           GROUP BY survey_id
         ) r ON s.id = r.survey_id
         WHERE s.disease_id = $1 
         ORDER BY s.created_at DESC`,
        [diseaseId]
      );

      return result.rows.map((row: DatabaseSurveyRow) => this.mapRowToSurvey(row));
    } catch (error: unknown) {
      console.error('[Survey Service] Get surveys by disease failed:', error);
      throw new Error('فشل في استرجاع استطلاعات المرض');
    }
  }

  async getSurveysByRegion(regionId: string): Promise<Survey[]> {
    try {
      const result = await this.dbService.query(
        `SELECT s.id, s.title, s.description, s.disease_id, s.region_id, s.status, 
                s.start_date, s.end_date, s.questions, s.created_by, s.created_at, s.updated_at,
                COALESCE(r.response_count, 0) as responses_count
         FROM surveys s
         LEFT JOIN (
           SELECT survey_id, COUNT(*) as response_count
           FROM survey_responses
           GROUP BY survey_id
         ) r ON s.id = r.survey_id
         WHERE s.region_id = $1 
         ORDER BY s.created_at DESC`,
        [regionId]
      );

      return result.rows.map((row: DatabaseSurveyRow) => this.mapRowToSurvey(row));
    } catch (error: unknown) {
      console.error('[Survey Service] Get surveys by region failed:', error);
      throw new Error('فشل في استرجاع استطلاعات المنطقة');
    }
  }

  async submitSurveyResponse(responseData: {
    survey_id: string;
    respondent_id?: string;
    answers: SurveyAnswer[];
    ip_address?: string;
    user_agent?: string;
  }): Promise<SurveyResponse> {
    try {
      // Validate survey exists and is active
      const survey = await this.getSurveyById(responseData.survey_id);
      if (!survey) {
        throw new Error('الاستطلاع غير موجود');
      }

      if (survey.status !== 'active') {
        throw new Error('الاستطلاع غير نشط حالياً');
      }

      // Check if survey is within date range
      const now = new Date();
      if (survey.start_date > now) {
        throw new Error('الاستطلاع لم يبدأ بعد');
      }

      if (survey.end_date && survey.end_date < now) {
        throw new Error('انتهت فترة الاستطلاع');
      }

      // Validate answers against questions
      const requiredQuestions = survey.questions.filter(q => q.required);
      const answeredQuestionIds = responseData.answers.map(a => a.question_id);
      
      for (const question of requiredQuestions) {
        if (!answeredQuestionIds.includes(question.id)) {
          throw new Error(`السؤال "${question.question}" مطلوب`);
        }
      }

      const result = await this.dbService.query(
        `INSERT INTO survey_responses (survey_id, respondent_id, answers, ip_address, user_agent) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, survey_id, respondent_id, answers, submitted_at, ip_address, user_agent`,
        [
          responseData.survey_id,
          responseData.respondent_id || null,
          JSON.stringify(responseData.answers),
          responseData.ip_address || null,
          responseData.user_agent || null
        ]
      );

      const row = result.rows[0];
      return {
        id: row.id,
        survey_id: row.survey_id,
        respondent_id: row.respondent_id,
        answers: row.answers || [],
        submitted_at: row.submitted_at,
        ip_address: row.ip_address,
        user_agent: row.user_agent
      };
    } catch (error) {
      console.error('[Survey Service] Submit response failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('فشل في إرسال الاستجابة');
    }
  }

  async getSurveyResponses(surveyId: string, limit: number = 50, offset: number = 0): Promise<SurveyResponse[]> {
    try {
      const result = await this.dbService.query(
        `SELECT id, survey_id, respondent_id, answers, submitted_at, ip_address, user_agent
         FROM survey_responses 
         WHERE survey_id = $1 
         ORDER BY submitted_at DESC 
         LIMIT $2 OFFSET $3`,
        [surveyId, limit, offset]
      );

      return result.rows.map((row: any) => ({
        id: row.id,
        survey_id: row.survey_id,
        respondent_id: row.respondent_id,
        answers: row.answers || [],
        submitted_at: row.submitted_at,
        ip_address: row.ip_address,
        user_agent: row.user_agent
      }));
    } catch (error) {
      console.error('[Survey Service] Get survey responses failed:', error);
      throw new Error('فشل في استرجاع استجابات الاستطلاع');
    }
  }

  async getStatistics(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<SurveyStatistics> {
    try {
      const periodCondition = this.getPeriodCondition(period);

      const [surveysResult, activeSurveysResult, completedSurveysResult, responsesResult] = await Promise.all([
        this.dbService.query('SELECT COUNT(*) as count FROM surveys'),
        this.dbService.query("SELECT COUNT(*) as count FROM surveys WHERE status = 'active'"),
        this.dbService.query("SELECT COUNT(*) as count FROM surveys WHERE status = 'completed'"),
        this.dbService.query(`SELECT COUNT(*) as count FROM survey_responses WHERE submitted_at >= ${periodCondition}`)
      ]);

      const totalSurveys = parseInt(surveysResult.rows[0].count);
      const totalResponses = parseInt(responsesResult.rows[0].count);

      return {
        total_surveys: totalSurveys,
        active_surveys: parseInt(activeSurveysResult.rows[0].count),
        completed_surveys: parseInt(completedSurveysResult.rows[0].count),
        total_responses: totalResponses,
        average_responses_per_survey: totalSurveys > 0 ? totalResponses / totalSurveys : 0,
        completion_rate: 0 // This would need more complex calculation
      };
    } catch (error) {
      console.error('[Survey Service] Get statistics failed:', error);
      throw new Error('فشل في استرجاع إحصائيات الاستطلاعات');
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