'use strict';

const swaggerJsdoc = require('swagger-jsdoc');
const config = require('../config');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'AI Smart Study Assistant API',
      version: '1.0.0',
      description:
        'Complete REST API for the AI Smart Study Assistant — authentication, notes, AI summaries, quizzes, timetable, notifications, analytics, and admin management.',
      contact: {
        name: 'Support',
        email: 'support@aistudyassistant.app',
      },
      license: { name: 'MIT' },
    },
    servers: [
      {
        url: `http://localhost:${config.port}${config.api.prefix}`,
        description: 'Development',
      },
      {
        url: `https://ai-study-assistant-api.onrender.com${config.api.prefix}`,
        description: 'Production (Render)',
      },
      {
        url: `https://ai-study-assistant-api.up.railway.app${config.api.prefix}`,
        description: 'Production (Railway)',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Provide your access token here: `Bearer <token>`',
        },
      },
      schemas: {
        // ── Generic ────────────────────────────────────────────────────────
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            statusCode: { type: 'integer', example: 400 },
            message: { type: 'string', example: 'Bad Request' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
        // ── Auth ───────────────────────────────────────────────────────────
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Student Name' },
            email: { type: 'string', format: 'email', example: 'student@example.com' },
            password: { type: 'string', minLength: 8, example: 'SecureP@ss1' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' },
                user: { $ref: '#/components/schemas/UserPublic' },
              },
            },
          },
        },
        // ── User ───────────────────────────────────────────────────────────
        UserPublic: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['student', 'admin'] },
            avatar: { type: 'string' },
            isEmailVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // ── Study note ─────────────────────────────────────────────────────
        Note: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string' },
            title: { type: 'string', example: 'Photosynthesis Notes' },
            content: { type: 'string' },
            subject: { type: 'string', example: 'Biology' },
            tags: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // ── Timetable ──────────────────────────────────────────────────────
        TimetableEntry: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string', example: 'Maths Revision' },
            subject: { type: 'string' },
            type: { type: 'string', enum: ['study', 'revision', 'lecture', 'break', 'other'] },
            startTime: { type: 'string', example: '09:00' },
            endTime: { type: 'string', example: '10:30' },
            date: { type: 'string', format: 'date' },
            color: { type: 'string', example: '#FF7A00' },
            isCompleted: { type: 'boolean' },
          },
        },
        // ── Quiz ───────────────────────────────────────────────────────────
        Quiz: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            questions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string' },
                  options: { type: 'array', items: { type: 'string' } },
                  answer: { type: 'string' },
                  explanation: { type: 'string' },
                },
              },
            },
          },
        },
        // ── Admin ──────────────────────────────────────────────────────────
        AdminUserList: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                users: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/UserPublic' },
                },
                pagination: { $ref: '#/components/schemas/Pagination' },
              },
            },
          },
        },
        SystemStats: {
          type: 'object',
          properties: {
            users: { type: 'object', properties: { total: { type: 'integer' }, active: { type: 'integer' }, newToday: { type: 'integer' } } },
            notes: { type: 'object', properties: { total: { type: 'integer' }, createdToday: { type: 'integer' } } },
            ai: { type: 'object', properties: { totalRequests: { type: 'integer' }, requestsToday: { type: 'integer' } } },
            quizzes: { type: 'object', properties: { total: { type: 'integer' } } },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Unauthorized — missing or invalid Bearer token',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        Forbidden: {
          description: 'Forbidden — insufficient role',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        NotFound: {
          description: 'Resource not found',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        TooManyRequests: {
          description: 'Rate limit exceeded',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        ValidationError: {
          description: 'Validation failed',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Registration, login, token refresh, password reset' },
      { name: 'Users', description: 'User profile and settings' },
      { name: 'Notes', description: 'Study notes CRUD' },
      { name: 'AI', description: 'AI summarisation, Q&A, and quiz generation' },
      { name: 'OCR', description: 'Scan notes via image / PDF OCR' },
      { name: 'Timetable', description: 'Study schedule and exam management' },
      { name: 'Notifications', description: 'Push notification tokens and history' },
      { name: 'Analytics', description: 'Study activity and learning analytics' },
      { name: 'Uploads', description: 'File upload management' },
      { name: 'Admin', description: 'Admin-only management APIs (role: admin)' },
    ],
  },
  apis: [
    `${__dirname}/../routes/*.js`,
    `${__dirname}/../controllers/*.js`,
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
