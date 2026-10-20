var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { WebSocketGateway, WebSocketServer, SubscribeMessage, } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
let GpsGateway = (() => {
    let _classDecorators = [WebSocketGateway({
            cors: {
                origin: ['http://localhost:4200', 'http://localhost:3000'],
                credentials: true,
            },
            namespace: 'gps',
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _server_decorators;
    let _server_initializers = [];
    let _server_extraInitializers = [];
    let _handleLocationUpdate_decorators;
    let _handleJoinBus_decorators;
    let _handleLeaveBus_decorators;
    var GpsGateway = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _server_decorators = [WebSocketServer()];
            _handleLocationUpdate_decorators = [SubscribeMessage('update-location')];
            _handleJoinBus_decorators = [SubscribeMessage('join-bus')];
            _handleLeaveBus_decorators = [SubscribeMessage('leave-bus')];
            __esDecorate(this, null, _handleLocationUpdate_decorators, { kind: "method", name: "handleLocationUpdate", static: false, private: false, access: { has: obj => "handleLocationUpdate" in obj, get: obj => obj.handleLocationUpdate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _handleJoinBus_decorators, { kind: "method", name: "handleJoinBus", static: false, private: false, access: { has: obj => "handleJoinBus" in obj, get: obj => obj.handleJoinBus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _handleLeaveBus_decorators, { kind: "method", name: "handleLeaveBus", static: false, private: false, access: { has: obj => "handleLeaveBus" in obj, get: obj => obj.handleLeaveBus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, null, _server_decorators, { kind: "field", name: "server", static: false, private: false, access: { has: obj => "server" in obj, get: obj => obj.server, set: (obj, value) => { obj.server = value; } }, metadata: _metadata }, _server_initializers, _server_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            GpsGateway = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        gpsService = __runInitializers(this, _instanceExtraInitializers);
        server = __runInitializers(this, _server_initializers, void 0);
        logger = (__runInitializers(this, _server_extraInitializers), new Logger(GpsGateway.name));
        constructor(gpsService) {
            this.gpsService = gpsService;
        }
        handleConnection(client) {
            this.logger.log(`🔌 Cliente conectado: ${client.id}`);
        }
        handleDisconnect(client) {
            this.logger.log(`🔌 Cliente desconectado: ${client.id}`);
        }
        // El simulador o el chofer envía su posición
        async handleLocationUpdate(data, client) {
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
        handleJoinBus(data, client) {
            client.join(`bus:${data.busId}`);
            this.logger.log(`Cliente ${client.id} se unió a la sala bus:${data.busId}`);
            return { joined: true, room: `bus:${data.busId}` };
        }
        // Los pasajeros/admin salen de la sala del bus
        handleLeaveBus(data, client) {
            client.leave(`bus:${data.busId}`);
            return { left: true };
        }
    };
    return GpsGateway = _classThis;
})();
export { GpsGateway };
