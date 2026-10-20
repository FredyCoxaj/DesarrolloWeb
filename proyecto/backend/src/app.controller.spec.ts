import { describe, it, expect, beforeEach, vi } from 'vitest';
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
            user: { count: vi.fn().mockResolvedValue(5) },
            route: { count: vi.fn().mockResolvedValue(4) },
            bus: { count: vi.fn().mockResolvedValue(4) },
            trip: { count: vi.fn().mockResolvedValue(1) },
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

    it('debería retornar el mensaje de bienvenida', () => {
       expect(appController.getHello()).toContain('RutaBus GT API');
  });
  it('debería retornar el estado ok y los counts de la DB', async () => {
    const result = await appController.healthCheck();
    expect(result.status).toBe('ok');
    expect(result.database).toBe('connected');
    expect(result.counts.users).toBe(5);
  });
});