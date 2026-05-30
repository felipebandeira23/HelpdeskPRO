import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('HelpdeskPRO E2E Tests', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: string;
  let ticketId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('should return 200 on GET /', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          expect(res.text).toContain('Hello World');
        });
    });
  });

  describe('Authentication (POST /auth/login)', () => {
    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'admin@helpdeskpro.local',
          password: 'admin123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe('admin@helpdeskpro.local');
          accessToken = res.body.access_token;
          userId = res.body.user.id;
        });
    });

    it('should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'admin@helpdeskpro.local',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should reject non-existent user', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('Tickets (GET /api/tickets)', () => {
    it('should return tickets with valid token', () => {
      return request(app.getHttpServer())
        .get('/api/tickets')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
        });
    });

    it('should reject request without token', () => {
      return request(app.getHttpServer())
        .get('/api/tickets')
        .expect(401);
    });

    it('should reject request with invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/tickets')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });
  });

  describe('Create Ticket (POST /api/tickets)', () => {
    it('should create a new ticket', () => {
      return request(app.getHttpServer())
        .post('/api/tickets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'E2E Test Ticket',
          description: 'Testing ticket creation via E2E test',
          priority: 'HIGH',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('E2E Test Ticket');
          expect(res.body.status).toBe('OPEN');
          ticketId = res.body.id;
        });
    });

    it('should reject ticket creation without title', () => {
      return request(app.getHttpServer())
        .post('/api/tickets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          description: 'Missing title',
          priority: 'MEDIUM',
        })
        .expect(400);
    });
  });

  describe('Get Single Ticket (GET /api/tickets/:id)', () => {
    it('should get a specific ticket', () => {
      return request(app.getHttpServer())
        .get(`/api/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(ticketId);
          expect(res.body.title).toBe('E2E Test Ticket');
        });
    });

    it('should return 404 for non-existent ticket', () => {
      return request(app.getHttpServer())
        .get('/api/tickets/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('Update Ticket (PATCH /api/tickets/:id)', () => {
    it('should update a ticket status', () => {
      return request(app.getHttpServer())
        .patch(`/api/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          status: 'IN_PROGRESS',
          progress: 50,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('IN_PROGRESS');
          expect(res.body.progress).toBe(50);
        });
    });
  });

  describe('Delete Ticket (DELETE /api/tickets/:id)', () => {
    it('should delete a ticket', () => {
      return request(app.getHttpServer())
        .delete(`/api/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should return 404 when deleting non-existent ticket', () => {
      return request(app.getHttpServer())
        .delete('/api/tickets/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('Stats (GET /api/stats)', () => {
    it('should return dashboard stats', () => {
      return request(app.getHttpServer())
        .get('/api/stats')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('total_tickets');
          expect(res.body).toHaveProperty('open_tickets');
          expect(res.body).toHaveProperty('closed_tickets');
          expect(res.body).toHaveProperty('average_priority');
        });
    });
  });
});
