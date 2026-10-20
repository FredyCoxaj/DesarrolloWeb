import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Wallet (Billetera Digital)')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Consultar saldo de la billetera' })
  getBalance(@CurrentUser() user: any) {
    return this.walletService.getBalance(user.id);
  }

  @Post('topup')
  @ApiOperation({ summary: 'Recargar saldo (Monto en Quetzales)' })
  recargar(@Body() body: { monto: number }, @CurrentUser() user: any) {
    return this.walletService.recargar(user.id, Number(body.monto));
  }

  @Post('pay-ticket')
  @ApiOperation({ summary: 'Pagar un ticket usando el saldo de la billetera' })
  pagarTicket(@Body() body: { ticketId: string }, @CurrentUser() user: any) {
    return this.walletService.pagarTicket(body.ticketId, user.id);
  }
}