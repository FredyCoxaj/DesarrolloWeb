import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: {
            user: { count: jest.fn().mockResolvedValue(5) },
            route: { count: jest.fn().mockResolvedValue(4) },
            bus: { count: jest.fn().mockResolvedValue(4) },
            trip: { count: jest.fn().mockResolvedValue(1) },
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('debería retornar el mensaje de bienvenida', () => {
      expect(appController.getHello()).toBe('RutaBus GT API  - v0.1.0');
    });
  });

  describe('health', () => {
    it('debería retornar el estado ok y los counts de la DB', async () => {
      const result = await appController.healthCheck();
      expect(result.status).toBe('ok');
      expect(result.database).toBe('connected');
      expect(result.counts.users).toBe(5);
    });
  });
});