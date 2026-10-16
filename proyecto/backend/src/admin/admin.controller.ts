import { Controller, Get, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  dashboard(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.adminService.dashboard(fechaInicio, fechaFin);
  }

  @Get('revenue/by-bus')
  revenueByBus(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.adminService.revenueByBus(fechaInicio, fechaFin);
  }

  @Get('reports/top-routes')
  topRoutes(
    @Query('limite') limite?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.adminService.topRoutes(limite ? parseInt(limite, 10) : 10, fechaInicio, fechaFin);
  }

  @Get('reports/top-passengers')
  topPassengers(
    @Query('limite') limite?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.adminService.topPassengers(
      limite ? parseInt(limite, 10) : 10,
      fechaInicio,
      fechaFin,
    );
  }

  @Get('alerts')
  alerts() {
    return this.adminService.alerts();
  }
}