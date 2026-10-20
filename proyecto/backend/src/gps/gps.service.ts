import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GpsUpdateDto } from './dto/gps-update.dto';

@Injectable()
export class GpsService {
  private readonly logger = new Logger(GpsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async saveLog(dto: GpsUpdateDto) {
    const log = await this.prisma.gpsLog.create({
      data: {
        busId: dto.busId,
        tripId: dto.tripId,
        latitud: dto.latitud,
        longitud: dto.longitud,
        velocidad: dto.velocidad,
        rumbo: dto.rumbo,
      },
    });
    return log;
  }

  async getLatestByBus(busId: string) {
    return this.prisma.gpsLog.findFirst({
      where: { busId },
      orderBy: { timestamp: 'desc' },
    });
  }
}