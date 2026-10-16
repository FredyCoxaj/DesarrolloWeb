import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PaymentsService } from './payments.service';
import { CashPaymentDto } from './dto/cash-payment.dto';
import { CardPaymentDto } from './dto/card-payment.dto';
import { BankPaymentDto } from './dto/bank-payment.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // CHOFER: cobro en efectivo
  @Roles(Role.CHOFER)
  @Post('cash')
  @HttpCode(HttpStatus.CREATED)
  cash(@Body() dto: CashPaymentDto, @CurrentUser() user: any) {
    return this.paymentsService.cash(dto, user.id);
  }

  // PASAJERO: pagar con tarjeta
  @Post('card')
  @HttpCode(HttpStatus.CREATED)
  card(@Body() dto: CardPaymentDto, @CurrentUser() user: any) {
    return this.paymentsService.card(dto, user.id);
  }

  // PASAJERO: pagar con cuenta bancaria
  @Post('bank')
  @HttpCode(HttpStatus.CREATED)
  bank(@Body() dto: BankPaymentDto, @CurrentUser() user: any) {
    return this.paymentsService.bank(dto, user.id);
  }

  // PASAJERO: mi historial de pagos
  @Get('my-payments')
  myPayments(@CurrentUser() user: any) {
    return this.paymentsService.myPayments(user.id);
  }

  // CHOFER/ADMIN: pagos de un viaje
  @Roles(Role.CHOFER, Role.ADMIN)
  @Get('trip/:tripId')
  byTrip(@Param('tripId') tripId: string, @CurrentUser() user: any) {
    return this.paymentsService.byTrip(tripId, user.id, user.rol);
  }

  // ADMIN: resumen por bus y fecha
  @Roles(Role.ADMIN)
  @Get('summary/:busId/:fecha')
  summary(@Param('busId') busId: string, @Param('fecha') fecha: string) {
    return this.paymentsService.summaryByBusAndDate(busId, fecha);
  }
}