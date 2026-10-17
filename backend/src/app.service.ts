import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'RutaBus GT API  - v0.1.0';
  }

  async healthCheck() {
    const [users, routes, buses, trips] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.route.count(),
      this.prisma.bus.count(),
      this.prisma.trip.count(),
    ]);

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      counts: { users, routes, buses, trips },
    };
  }
}