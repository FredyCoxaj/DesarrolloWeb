import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { GpsService } from './gps.service';
import { GpsUpdateDto } from './dto/gps-update.dto';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:4200', 'http://localhost:3000'],
    credentials: true,
  },
  namespace: 'gps',
})
export class GpsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GpsGateway.name);

  constructor(private readonly gpsService: GpsService) {}

  handleConnection(client: Socket) {
    this.logger.log(`🔌 Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`🔌 Cliente desconectado: ${client.id}`);
  }

  // El simulador o el chofer envía su posición
  @SubscribeMessage('update-location')
  async handleLocationUpdate(
    @MessageBody() data: GpsUpdateDto,
    @ConnectedSocket() client: Socket,
  ) {
    // 1. Guardar en base de datos
    await this.gpsService.saveLog(data);

    // 2. Emitir a todos los que estén escuchando este bus en específico
    this.server.to(`bus:${data.busId}`).emit('bus-location', {
      busId: data.busId,
      tripId: data.tripId,
      lat: data.latitud,
      lng: data.longitud,
      velocidad: data.velocidad,
      rumbo: data.rumbo,
      timestamp: new Date(),
    });

    // 3. Emitir al canal global (para el mapa del administrador)
    this.server.emit('all-buses', {
      busId: data.busId,
      lat: data.latitud,
      lng: data.longitud,
      timestamp: new Date(),
    });

    return { status: 'ok' };
  }

  // Los pasajeros/admin se unen a la sala de un bus
  @SubscribeMessage('join-bus')
  handleJoinBus(
    @MessageBody() data: { busId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`bus:${data.busId}`);
    this.logger.log(`Cliente ${client.id} se unió a la sala bus:${data.busId}`);
    return { joined: true, room: `bus:${data.busId}` };
  }

  // Los pasajeros/admin salen de la sala del bus
  @SubscribeMessage('leave-bus')
  handleLeaveBus(
    @MessageBody() data: { busId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`bus:${data.busId}`);
    return { left: true };
  }
}