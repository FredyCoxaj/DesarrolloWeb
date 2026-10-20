import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PncService } from '../auth/pnc.service';
import { VerifyPncDto } from './dto/verify-pnc.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('PNC')
@Controller('pnc')
export class PncController {
  constructor(private readonly pncService: PncService) {}

  @Public()
  @Post('verify')
  @ApiOperation({ summary: 'Verificar si un DPI tiene antecedentes penales (Mock)' })
  async verify(@Body() dto: VerifyPncDto) {
    return this.pncService.verificarAntecedentes(dto.dpi);
  }
}