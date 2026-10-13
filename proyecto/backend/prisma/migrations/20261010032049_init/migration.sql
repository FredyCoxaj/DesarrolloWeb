-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PASAJERO', 'CHOFER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PncStatus" AS ENUM ('PENDIENTE', 'VERIFICADO', 'CON_ANTECEDENTES', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "BusEstado" AS ENUM ('ACTIVO', 'MANTENIMIENTO', 'FUERA_SERVICIO');

-- CreateEnum
CREATE TYPE "TripEstado" AS ENUM ('PROGRAMADO', 'EN_CURSO', 'COMPLETADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TicketEstado" AS ENUM ('RESERVADO', 'PAGADO', 'ABORDADO', 'CANCELADO', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "PagoMetodo" AS ENUM ('EFECTIVO', 'TARJETA', 'CUENTA_BANCARIA');

-- CreateEnum
CREATE TYPE "PagoEstado" AS ENUM ('PENDIENTE', 'COMPLETADO', 'FALLIDO', 'REEMBOLSADO');

-- CreateEnum
CREATE TYPE "IncidenteTipo" AS ENUM ('TRAFICO', 'AVERIA', 'ACCIDENTE', 'SOBRECUPO', 'PASAJERO_CONFLICTIVO', 'OTRO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "dpi" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "passwordHash" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3),
    "esMenor" BOOLEAN NOT NULL DEFAULT false,
    "tutorId" TEXT,
    "rol" "Role" NOT NULL DEFAULT 'PASAJERO',
    "pncStatus" "PncStatus" NOT NULL DEFAULT 'PENDIENTE',
    "pncVerificadoEn" TIMESTAMP(3),
    "fotoUrl" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buses" (
    "id" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "marca" TEXT,
    "modelo" TEXT,
    "anio" INTEGER,
    "capacidad" INTEGER NOT NULL,
    "filas" INTEGER NOT NULL DEFAULT 10,
    "columnas" INTEGER NOT NULL DEFAULT 4,
    "estado" "BusEstado" NOT NULL DEFAULT 'ACTIVO',
    "fotoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "origen" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "precioBase" DECIMAL(10,2) NOT NULL,
    "duracionMin" INTEGER NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "color" TEXT NOT NULL DEFAULT '#1E3A8A',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_stops" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "orden" INTEGER NOT NULL,
    "esTerminal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "route_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "busId" TEXT NOT NULL,
    "choferId" TEXT NOT NULL,
    "fechaSalida" TIMESTAMP(3) NOT NULL,
    "fechaLlegada" TIMESTAMP(3),
    "estado" "TripEstado" NOT NULL DEFAULT 'PROGRAMADO',
    "asientosOcupados" INTEGER NOT NULL DEFAULT 0,
    "etaMin" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "pasajeroId" TEXT NOT NULL,
    "asiento" INTEGER NOT NULL,
    "paradaSubidaId" TEXT,
    "paradaBajadaId" TEXT,
    "precio" DECIMAL(10,2) NOT NULL,
    "estado" "TicketEstado" NOT NULL DEFAULT 'RESERVADO',
    "qrCode" TEXT NOT NULL,
    "codigoAbordaje" TEXT,
    "abordadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "metodo" "PagoMetodo" NOT NULL,
    "estado" "PagoEstado" NOT NULL DEFAULT 'PENDIENTE',
    "referencia" TEXT,
    "registradoPor" TEXT,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gps_logs" (
    "id" TEXT NOT NULL,
    "busId" TEXT NOT NULL,
    "tripId" TEXT,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "velocidad" DOUBLE PRECISION,
    "rumbo" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gps_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "tripId" TEXT,
    "reportadoPor" TEXT NOT NULL,
    "tipo" "IncidenteTipo" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "resuelto" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "tipo" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_dpi_key" ON "users"("dpi");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_dpi_idx" ON "users"("dpi");

-- CreateIndex
CREATE INDEX "users_rol_idx" ON "users"("rol");

-- CreateIndex
CREATE UNIQUE INDEX "buses_placa_key" ON "buses"("placa");

-- CreateIndex
CREATE INDEX "route_stops_routeId_idx" ON "route_stops"("routeId");

-- CreateIndex
CREATE INDEX "trips_routeId_idx" ON "trips"("routeId");

-- CreateIndex
CREATE INDEX "trips_busId_idx" ON "trips"("busId");

-- CreateIndex
CREATE INDEX "trips_choferId_idx" ON "trips"("choferId");

-- CreateIndex
CREATE INDEX "trips_estado_idx" ON "trips"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_qrCode_key" ON "tickets"("qrCode");

-- CreateIndex
CREATE INDEX "tickets_pasajeroId_idx" ON "tickets"("pasajeroId");

-- CreateIndex
CREATE INDEX "tickets_estado_idx" ON "tickets"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_tripId_asiento_key" ON "tickets"("tripId", "asiento");

-- CreateIndex
CREATE UNIQUE INDEX "payments_ticketId_key" ON "payments"("ticketId");

-- CreateIndex
CREATE INDEX "payments_metodo_idx" ON "payments"("metodo");

-- CreateIndex
CREATE INDEX "payments_estado_idx" ON "payments"("estado");

-- CreateIndex
CREATE INDEX "gps_logs_busId_timestamp_idx" ON "gps_logs"("busId", "timestamp");

-- CreateIndex
CREATE INDEX "gps_logs_tripId_idx" ON "gps_logs"("tripId");

-- CreateIndex
CREATE INDEX "incidents_tripId_idx" ON "incidents"("tripId");

-- CreateIndex
CREATE INDEX "incidents_resuelto_idx" ON "incidents"("resuelto");

-- CreateIndex
CREATE INDEX "notifications_userId_leida_idx" ON "notifications"("userId", "leida");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_busId_fkey" FOREIGN KEY ("busId") REFERENCES "buses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_choferId_fkey" FOREIGN KEY ("choferId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_pasajeroId_fkey" FOREIGN KEY ("pasajeroId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gps_logs" ADD CONSTRAINT "gps_logs_busId_fkey" FOREIGN KEY ("busId") REFERENCES "buses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gps_logs" ADD CONSTRAINT "gps_logs_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_reportadoPor_fkey" FOREIGN KEY ("reportadoPor") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
