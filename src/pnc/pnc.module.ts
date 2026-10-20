import { Module } from '@nestjs/common';
import { PncController } from './pnc.controller';
import { PncService } from '../auth/pnc.service';

@Module({
  controllers: [PncController],
  providers: [PncService],
})
export class PncModule {}