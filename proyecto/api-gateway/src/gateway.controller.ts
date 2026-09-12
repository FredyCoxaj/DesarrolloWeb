import { Controller, All, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { lastValueFrom } from 'rxjs';

@Controller()
export class GatewayController {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  @All('auth/*')
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    const url = `${this.configService.get('AUTH_SERVICE_URL')}${req.originalUrl}`;
    return this.proxyRequest(req, res, url);
  }

  @All('trips/*')
  async handleTrips(@Req() req: Request, @Res() res: Response) {
    const url = `${this.configService.get('TRIPS_SERVICE_URL')}${req.originalUrl}`;
    return this.proxyRequest(req, res, url);
  }

  @All('fleet/*')
  async handleFleet(@Req() req: Request, @Res() res: Response) {
    const url = `${this.configService.get('FLEET_SERVICE_URL')}${req.originalUrl}`;
    return this.proxyRequest(req, res, url);
  }

  private async proxyRequest(req: Request, res: Response, url: string) {
    try {
      const method = req.method.toLowerCase();
      
      // Crear headers limpios (sin content-length, sin host)
      const headers: any = {};
      Object.keys(req.headers).forEach((key) => {
        if (key !== 'host' && key !== 'content-length' && key !== 'connection') {
          headers[key] = req.headers[key];
        }
      });

      const config = { headers, timeout: 10000 };

      let response;
      switch (method) {
        case 'get':
          response = await lastValueFrom(this.httpService.get(url, config));
          break;
        case 'post':
          response = await lastValueFrom(
            this.httpService.post(url, req.body, config),
          );
          break;
        case 'put':
          response = await lastValueFrom(
            this.httpService.put(url, req.body, config),
          );
          break;
        case 'delete':
          response = await lastValueFrom(this.httpService.delete(url, config));
          break;
        default:
          return res.status(405).json({ error: 'Metodo no permitido' });
      }
      return res.status(response.status).json(response.data);
    } catch (error) {
      console.error('Error en gateway:', error.message);
      console.error('Detalles:', error.response?.data || 'sin detalles');
      const status = error.response?.status || 500;
      const data = error.response?.data || { error: 'Error interno del servidor' };
      return res.status(status).json(data);
    }
  }
}