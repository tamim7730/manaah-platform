#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, CallToolRequest, ListToolsRequest, ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { DatabaseService } from './services/database.js';
import { AuthService } from './services/auth.js';
import { DiseaseService } from './services/disease.js';
import { RegionService } from './services/region.js';
import { SurveyService } from './services/survey.js';
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Setup Express server for health checks and monitoring
const app = express();
app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'مرحباً بك في خادم منصة مناح لإدارة الأمراض الوبائية',
    service: 'Manaah MCP Server',
    version: process.env.MCP_SERVER_VERSION || '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      documentation: 'هذا خادم MCP مخصص لإدارة الأمراض الوبائية'
    }
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Manaah MCP Server',
    version: process.env.MCP_SERVER_VERSION || '1.0.0'
  });
});

// Start Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[Health Server] Running on port ${PORT}`);
});

class ManaahMCPServer {
  private server: Server;
  private dbService: DatabaseService;
  private authService: AuthService;
  private diseaseService: DiseaseService;
  private regionService: RegionService;
  private surveyService: SurveyService;

  constructor() {
    console.error('[Setup] Initializing Manaah MCP Server...');
    
    this.server = new Server(
      {
        name: process.env.MCP_SERVER_NAME || 'manaah-mcp-server',
        version: process.env.MCP_SERVER_VERSION || '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize services
    this.dbService = new DatabaseService();
    this.authService = new AuthService();
    this.diseaseService = new DiseaseService(this.dbService);
    this.regionService = new RegionService(this.dbService);
    this.surveyService = new SurveyService(this.dbService);

    this.setupToolHandlers();
    
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    
    process.on('SIGINT', async () => {
      console.error('[Shutdown] Gracefully shutting down MCP server...');
      await this.cleanup();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    // List all available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async (request: ListToolsRequest) => {
      return {
        tools: [
          {
            name: 'get_diseases',
            description: 'استرجاع قائمة الأمراض الوبائية المسجلة في النظام',
            inputSchema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number',
                  description: 'عدد النتائج المطلوب عرضها (افتراضي: 10)',
                  default: 10
                },
                offset: {
                  type: 'number',
                  description: 'رقم البداية للنتائج (افتراضي: 0)',
                  default: 0
                }
              }
            }
          },
          {
            name: 'get_disease_by_id',
            description: 'استرجاع تفاصيل مرض محدد بواسطة المعرف',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'معرف المرض'
                }
              },
              required: ['id']
            }
          },
          {
            name: 'create_disease',
            description: 'إنشاء مرض وبائي جديد في النظام',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'اسم المرض'
                },
                description: {
                  type: 'string',
                  description: 'وصف المرض'
                },
                symptoms: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'أعراض المرض'
                },
                prevention_measures: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'إجراءات الوقاية'
                },
                risk_level: {
                  type: 'string',
                  enum: ['low', 'medium', 'high', 'critical'],
                  description: 'مستوى الخطر'
                }
              },
              required: ['name', 'description', 'risk_level']
            }
          },
          {
            name: 'get_regions',
            description: 'استرجاع قائمة المناطق الجغرافية',
            inputSchema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number',
                  description: 'عدد النتائج المطلوب عرضها',
                  default: 10
                }
              }
            }
          },
          {
            name: 'get_surveys',
            description: 'استرجاع قائمة الاستبيانات الميدانية',
            inputSchema: {
              type: 'object',
              properties: {
                region_id: {
                  type: 'string',
                  description: 'معرف المنطقة لتصفية النتائج'
                },
                limit: {
                  type: 'number',
                  description: 'عدد النتائج المطلوب عرضها',
                  default: 10
                }
              }
            }
          },
          {
            name: 'create_survey',
            description: 'إنشاء استبيان ميداني جديد',
            inputSchema: {
              type: 'object',
              properties: {
                region_id: {
                  type: 'string',
                  description: 'معرف المنطقة'
                },
                survey_date: {
                  type: 'string',
                  format: 'date',
                  description: 'تاريخ الاستبيان'
                },
                surveyor_name: {
                  type: 'string',
                  description: 'اسم الباحث الميداني'
                },
                notes: {
                  type: 'string',
                  description: 'ملاحظات إضافية'
                }
              },
              required: ['region_id', 'survey_date', 'surveyor_name']
            }
          },
          {
            name: 'get_statistics',
            description: 'استرجاع إحصائيات عامة حول النظام',
            inputSchema: {
              type: 'object',
              properties: {
                period: {
                  type: 'string',
                  enum: ['week', 'month', 'quarter', 'year'],
                  description: 'الفترة الزمنية للإحصائيات',
                  default: 'month'
                },
                include_details: {
                  type: 'boolean',
                  description: 'تضمين تفاصيل إضافية'
                }
              }
            }
          },
          {
            name: 'search_diseases',
            description: 'البحث عن الأمراض بالاسم أو الوصف',
            inputSchema: {
              type: 'object',
              properties: {
                search_term: {
                  type: 'string',
                  description: 'مصطلح البحث في اسم أو وصف المرض'
                },
                limit: {
                  type: 'number',
                  description: 'الحد الأقصى لعدد النتائج',
                  default: 10
                }
              },
              required: ['search_term']
            }
          },
          {
            name: 'get_diseases_by_risk_level',
            description: 'استرجاع الأمراض مصنفة حسب مستوى الخطر',
            inputSchema: {
              type: 'object',
              properties: {
                risk_level: {
                  type: 'string',
                  enum: ['low', 'medium', 'high', 'critical'],
                  description: 'مستوى الخطر للتصفية'
                }
              },
              required: ['risk_level']
            }
          },
          {
            name: 'search_regions',
            description: 'البحث عن المناطق بالاسم أو الرمز',
            inputSchema: {
              type: 'object',
              properties: {
                search_term: {
                  type: 'string',
                  description: 'مصطلح البحث في اسم أو رمز المنطقة'
                },
                limit: {
                  type: 'number',
                  description: 'الحد الأقصى لعدد النتائج',
                  default: 20
                }
              },
              required: ['search_term']
            }
          },
          {
            name: 'get_regions_by_type',
            description: 'استرجاع المناطق مصنفة حسب النوع',
            inputSchema: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['country', 'state', 'city', 'district'],
                  description: 'نوع المنطقة للتصفية'
                }
              },
              required: ['type']
            }
          },
          {
            name: 'get_regions_nearby',
            description: 'العثور على المناطق القريبة من موقع محدد',
            inputSchema: {
              type: 'object',
              properties: {
                latitude: {
                  type: 'number',
                  description: 'خط العرض'
                },
                longitude: {
                  type: 'number',
                  description: 'خط الطول'
                },
                radius_km: {
                  type: 'number',
                  description: 'نطاق البحث بالكيلومتر',
                  default: 50
                },
                limit: {
                  type: 'number',
                  description: 'الحد الأقصى لعدد النتائج',
                  default: 10
                }
              },
              required: ['latitude', 'longitude']
            }
          },
          {
            name: 'search_surveys',
            description: 'البحث عن الاستبيانات بالعنوان أو الوصف',
            inputSchema: {
              type: 'object',
              properties: {
                search_term: {
                  type: 'string',
                  description: 'مصطلح البحث في عنوان أو وصف الاستبيان'
                },
                limit: {
                  type: 'number',
                  description: 'الحد الأقصى لعدد النتائج',
                  default: 20
                }
              },
              required: ['search_term']
            }
          },
          {
            name: 'get_surveys_by_disease',
            description: 'استرجاع الاستبيانات المتعلقة بمرض محدد',
            inputSchema: {
              type: 'object',
              properties: {
                disease_id: {
                  type: 'string',
                  description: 'معرف المرض لتصفية الاستبيانات'
                }
              },
              required: ['disease_id']
            }
          },
          {
            name: 'get_surveys_by_region',
            description: 'استرجاع الاستبيانات لمنطقة محددة',
            inputSchema: {
              type: 'object',
              properties: {
                region_id: {
                  type: 'string',
                  description: 'معرف المنطقة لتصفية الاستبيانات'
                }
              },
              required: ['region_id']
            }
          },
          {
            name: 'submit_survey_response',
            description: 'تقديم إجابة على استبيان',
            inputSchema: {
              type: 'object',
              properties: {
                survey_id: {
                  type: 'string',
                  description: 'معرف الاستبيان للإجابة عليه'
                },
                answers: {
                  type: 'array',
                  description: 'مصفوفة الإجابات على أسئلة الاستبيان',
                  items: {
                    type: 'object',
                    properties: {
                      question_id: {
                        type: 'string',
                        description: 'معرف السؤال'
                      },
                      answer: {
                        description: 'قيمة الإجابة (نص، رقم، منطقي، أو مصفوفة)'
                      }
                    },
                    required: ['question_id', 'answer']
                  }
                },
                respondent_id: {
                  type: 'string',
                  description: 'معرف المجيب الاختياري'
                }
              },
              required: ['survey_id', 'answers']
            }
          },
          {
            name: 'get_survey_responses',
            description: 'استرجاع إجابات استبيان محدد',
            inputSchema: {
              type: 'object',
              properties: {
                survey_id: {
                  type: 'string',
                  description: 'معرف الاستبيان لاسترجاع إجاباته'
                },
                limit: {
                  type: 'number',
                  description: 'الحد الأقصى لعدد الإجابات',
                  default: 50
                },
                offset: {
                  type: 'number',
                  description: 'عدد الإجابات المراد تخطيها',
                  default: 0
                }
              },
              required: ['survey_id']
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_diseases':
            return await this.handleGetDiseases(args);
          
          case 'get_disease_by_id':
            return await this.handleGetDiseaseById(args);
          
          case 'create_disease':
            return await this.handleCreateDisease(args);
          
          case 'get_regions':
            return await this.handleGetRegions(args);
          
          case 'get_surveys':
            return await this.handleGetSurveys(args);
          
          case 'create_survey':
            return await this.handleCreateSurvey(args);
          
          case 'get_statistics':
            return await this.handleGetStatistics(args);
          
          case 'search_diseases':
            return await this.handleSearchDiseases(args);
          
          case 'get_diseases_by_risk_level':
            return await this.handleGetDiseasesByRiskLevel(args);
          
          case 'search_regions':
            return await this.handleSearchRegions(args);
          
          case 'get_regions_by_type':
            return await this.handleGetRegionsByType(args);
          
          case 'get_regions_nearby':
            return await this.handleGetRegionsNearby(args);
          
          case 'search_surveys':
            return await this.handleSearchSurveys(args);
          
          case 'get_surveys_by_disease':
            return await this.handleGetSurveysByDisease(args);
          
          case 'get_surveys_by_region':
            return await this.handleGetSurveysByRegion(args);
          
          case 'submit_survey_response':
            return await this.handleSubmitSurveyResponse(args);
          
          case 'get_survey_responses':
            return await this.handleGetSurveyResponses(args);
          
          default:
            throw new McpError(ErrorCode.MethodNotFound, `أداة غير موجودة: ${name}`);
        }
      } catch (error: unknown) {
        console.error(`[Tool Error] ${name}:`, error);
        throw new McpError(
          ErrorCode.InternalError,
          `خطأ في تنفيذ الأداة ${name}: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
        );
      }
    });
  }

  private async handleGetDiseases(args: any): Promise<any> {
    try {
      const { limit = 10, offset = 0 } = args;
      const diseases = await this.diseaseService.getDiseases(limit, offset);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(diseases, null, 2)
        }]
      };
    } catch (error: unknown) {
      console.error('Error getting diseases:', error);
      throw error;
    }
  }

  private async handleGetDiseaseById(args: any): Promise<any> {
    try {
      const { id } = args;
      const disease = await this.diseaseService.getDiseaseById(id);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(disease, null, 2)
        }]
      };
    } catch (error: unknown) {
      console.error('Error getting disease by id:', error);
      throw error;
    }
  }

  private async handleCreateDisease(args: any): Promise<any> {
    try {
      const disease = await this.diseaseService.createDisease(args);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(disease, null, 2)
        }]
      };
    } catch (error: unknown) {
      console.error('Error creating disease:', error);
      throw error;
    }
  }

  private async handleGetRegions(args: any): Promise<any> {
    try {
      const { limit = 10 } = args;
      const regions = await this.regionService.getRegions(limit);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(regions, null, 2)
        }]
      };
    } catch (error: unknown) {
      console.error('Error getting regions:', error);
      throw error;
    }
  }

  private async handleGetSurveys(args: any): Promise<any> {
    try {
      const { region_id, limit = 10 } = args;
      const surveys = await this.surveyService.getSurveys(region_id, limit);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(surveys, null, 2)
        }]
      };
    } catch (error: unknown) {
      console.error('Error getting surveys:', error);
      throw error;
    }
  }

  private async handleCreateSurvey(args: any): Promise<any> {
    try {
      const survey = await this.surveyService.createSurvey(args);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(survey, null, 2)
        }]
      };
    } catch (error: unknown) {
      console.error('Error creating survey:', error);
      throw error;
    }
  }

  private async handleGetStatistics(args: any): Promise<any> {
    try {
      const { period = 'month', include_details = false } = args;
      
      // Get basic statistics
      const stats = {
        timestamp: new Date().toISOString(),
        period,
        total_diseases: await this.dbService.query(
          'SELECT COUNT(*) as count FROM diseases'
        ).then(result => parseInt(result.rows[0].count)),
        total_regions: await this.dbService.query(
          'SELECT COUNT(*) as count FROM regions'
        ).then(result => parseInt(result.rows[0].count)),
        total_surveys: await this.dbService.query(
          'SELECT COUNT(*) as count FROM surveys'
        ).then(result => parseInt(result.rows[0].count)),
        total_responses: await this.dbService.query(
          'SELECT COUNT(*) as count FROM survey_responses'
        ).then(result => parseInt(result.rows[0].count))
      };

      if (include_details) {
        // Add detailed breakdown
        const diseasesByRisk = await this.dbService.query(
          'SELECT risk_level, COUNT(*) as count FROM diseases GROUP BY risk_level'
        );
        const regionsByType = await this.dbService.query(
          'SELECT type, COUNT(*) as count FROM regions GROUP BY type'
        );
        
        const statsWithDetails = {
          ...stats,
          details: {
            diseases_by_risk: diseasesByRisk.rows,
            regions_by_type: regionsByType.rows
          }
        };
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(statsWithDetails, null, 2)
          }]
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(stats, null, 2)
        }]
      };
    } catch (error: unknown) {
      console.error('Error getting statistics:', error);
      throw error;
    }
  }

  private async handleSearchDiseases(args: any): Promise<any> {
    try {
      const { search_term, limit = 10 } = args;
      const diseases = await this.diseaseService.searchDiseases(search_term, limit);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(diseases, null, 2)
        }]
      };
    } catch (error: unknown) {
      console.error('Error searching diseases:', error);
      throw error;
    }
  }

  private async handleGetDiseasesByRiskLevel(args: any): Promise<any> {
    try {
      const { risk_level } = args;
      const diseases = await this.diseaseService.getDiseasesByRiskLevel(risk_level);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(diseases, null, 2)
        }]
      };
    } catch (error: unknown) {
      console.error('Error getting diseases by risk level:', error);
      throw error;
    }
  }

  private async handleSearchRegions(args: any): Promise<any> {
    try {
      const { search_term, limit = 20 } = args;
      const regions = await this.regionService.searchRegions(search_term, limit);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(regions, null, 2)
        }]
      };
    } catch (error: unknown) {
      console.error('Error searching regions:', error);
      throw error;
    }
  }

  private async handleGetRegionsByType(args: any): Promise<any> {
    try {
      const { type } = args;
      const regions = await this.regionService.getRegionsByType(type);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(regions, null, 2)
        }]
      };
    } catch (error: unknown) {
      console.error('Error getting regions by type:', error);
      throw error;
    }
  }

  private async handleGetRegionsNearby(args: any): Promise<any> {
    try {
      const { latitude, longitude, radius_km = 50, limit = 10 } = args;
      const regions = await this.regionService.getRegionsNearby(latitude, longitude, radius_km, limit);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(regions, null, 2)
        }]
      };
    } catch (error: unknown) {
      console.error('Error getting regions nearby:', error);
      throw error;
    }
  }

  private async handleSearchSurveys(args: any): Promise<any> {
    try {
      const { search_term, limit = 20 } = args;
      const surveys = await this.surveyService.searchSurveys(search_term, limit);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(surveys, null, 2)
        }]
      };
    } catch (error: unknown) {
      console.error('Error searching surveys:', error);
      throw error;
    }
  }

  private async handleGetSurveysByDisease(args: any): Promise<any> {
    try {
      const { disease_id } = args;
      const surveys = await this.surveyService.getSurveysByDisease(disease_id);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(surveys, null, 2)
        }]
      };
    } catch (error: unknown) {
      console.error('Error getting surveys by disease:', error);
      throw error;
    }
  }

  private async handleGetSurveysByRegion(args: any): Promise<any> {
    try {
      const { region_id } = args;
      const surveys = await this.surveyService.getSurveysByRegion(region_id);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(surveys, null, 2)
        }]
      };
    } catch (error: unknown) {
      console.error('Error getting surveys by region:', error);
      throw error;
    }
  }

  private async handleSubmitSurveyResponse(args: any): Promise<any> {
    try {
      const { survey_id, answers, respondent_id } = args;
      const response = await this.surveyService.submitSurveyResponse({
        survey_id,
        answers,
        respondent_id
      });
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }]
      };
    } catch (error: unknown) {
      console.error('Error submitting survey response:', error);
      throw error;
    }
  }

  private async handleGetSurveyResponses(args: any): Promise<any> {
    try {
      const { survey_id, limit = 50, offset = 0 } = args;
      const responses = await this.surveyService.getSurveyResponses(survey_id, limit, offset);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(responses, null, 2)
        }]
      };
    } catch (error: unknown) {
      console.error('Error getting survey responses:', error);
      throw error;
    }
  }

  private async cleanup(): Promise<void> {
    try {
      await this.dbService.close();
      console.error('[Cleanup] Database connection closed');
    } catch (error) {
      console.error('[Cleanup Error]', error);
    }
  }

  async start(): Promise<void> {
    try {
      await this.dbService.connect();
      console.error('[Database] Connected successfully');
      
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.error('[MCP Server] Started successfully');
    } catch (error) {
      console.error('[Startup Error]', error);
      process.exit(1);
    }
  }
}

// Start the server
const mcpServer = new ManaahMCPServer();
mcpServer.start().catch((error) => {
  console.error('[Fatal Error]', error);
  process.exit(1);
});