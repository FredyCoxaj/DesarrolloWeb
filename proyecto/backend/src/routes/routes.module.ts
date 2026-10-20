import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { PathfindingService } from './pathfinding.service';

@Module({
  controllers: [RoutesController],
  providers: [RoutesService, PathfindingService],
  exports: [RoutesService],
})
export class RoutesModule {}