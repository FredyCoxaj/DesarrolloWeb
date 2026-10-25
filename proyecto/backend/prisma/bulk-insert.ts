import { PrismaClient, Role, BusEstado, TripEstado, TicketEstado, PagoMetodo } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando inserción masiva de datos...\n');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // ============================================
  // 1. CREAR 10 USUARIOS (5 Pasajeros, 5 Choferes)
  // ============================================
  console.log('👥 Insertando usuarios...');
  const usuarios: any[] = []; // <-- Tipado para que no chille
  for (let i = 1; i <= 10; i++) {
    const esChofer = i <= 5;
    usuarios.push({
      dpi: `88888${i.toString().padStart(8, '0')}`,
      nombre: esChofer ? `Chofer` : `Pasajero`,
      apellido: `Prueba ${i}`,
      email: `user${i}@test.gt`,
      passwordHash,
      rol: esChofer ? Role.CHOFER : Role.PASAJERO,
      pncStatus: 'VERIFICADO' as any,
      saldo: esChofer ? 0 : 100,
    });
  }
  await prisma.user.createMany({ data: usuarios, skipDuplicates: true });
  
  const choferes = await prisma.user.findMany({ where: { rol: Role.CHOFER, email: { contains: '@test.gt' } } });
  const pasajeros = await prisma.user.findMany({ where: { rol: Role.PASAJERO, email: { contains: '@test.gt' } } });

  // ============================================
  // 2. CREAR 5 BUSES
  // ============================================
  console.log('🚌 Insertando buses...');
  const buses: any[] = []; // <-- Tipado
  for (let i = 1; i <= 5; i++) {
    buses.push({
      placa: `BULK-${i.toString().padStart(3, '0')}`,
      marca: 'Mercedes-Benz',
      modelo: 'Sprinter',
      anio: 2022,
      capacidad: 40,
      filas: 10,
      columnas: 4,
      estado: BusEstado.ACTIVO,
    });
  }
  await prisma.bus.createMany({ data: buses, skipDuplicates: true });
  const busesCreados = await prisma.bus.findMany({ where: { placa: { startsWith: 'BULK-' } } });

  // ============================================
  // 3. CREAR 5 RUTAS CON 3 PARADAS CADA UNA
  // ============================================
  console.log('🗺️ Insertando rutas y paradas...');
  const rutasIds: any[] = []; // <-- Tipado
  for (let i = 1; i <= 5; i++) {
    const ruta = await prisma.route.create({
      data: {
        nombre: `Ruta Masiva ${i}`,
        descripcion: 'Ruta generada automáticamente para pruebas',
        origen: 'Amatitlán',
        destino: `Destino ${i}`,
        precioBase: 15.00,
        duracionMin: 45,
        stops: {
          create: [
            { nombre: 'Parada A', latitud: 14.4771 + (i * 0.01), longitud: -90.6346, orden: 1, esTerminal: true },
            { nombre: 'Parada B', latitud: 14.5000 + (i * 0.01), longitud: -90.6000, orden: 2, esTerminal: false },
            { nombre: 'Parada C', latitud: 14.5500 + (i * 0.01), longitud: -90.5500, orden: 3, esTerminal: true },
          ]
        }
      },
      include: { stops: true }
    });
    rutasIds.push(ruta);
  }

  // ============================================
  // 4. CREAR 10 VIAJES (2 por cada ruta)
  // ============================================
  console.log('🛣️ Insertando viajes...');
  const viajesIds: any[] = []; // <-- Tipado
  for (let i = 0; i < 10; i++) {
    const ruta = rutasIds[i % rutasIds.length];
    const bus = busesCreados[i % busesCreados.length];
    const chofer = choferes[i % choferes.length];
    
    const fechaSalida = new Date();
    fechaSalida.setDate(fechaSalida.getDate() + (i % 2) + 1);
    fechaSalida.setHours(8 + i, 0, 0, 0);

    const viaje = await prisma.trip.create({
      data: {
        routeId: ruta.id,
        busId: bus.id,
        choferId: chofer.id,
        fechaSalida: fechaSalida,
        estado: TripEstado.PROGRAMADO,
      }
    });
    viajesIds.push({ viaje, ruta });
  }

  // ============================================
  // 5. CREAR 20 TICKETS Y SUS PAGOS
  // ============================================
  console.log('🎫 Insertando tickets y pagos...');
  let ticketsCreados = 0;

  for (let i = 0; i < 20; i++) {
    const { viaje, ruta } = viajesIds[i % viajesIds.length];
    const pasajero = pasajeros[i % pasajeros.length];
    const asiento = Math.floor(i / 2) + 1; 

    const ticket = await prisma.ticket.create({
      data: {
        tripId: viaje.id,
        pasajeroId: pasajero.id,
        asiento: asiento,
        paradaSubidaId: ruta.stops[0].id,
        paradaBajadaId: ruta.stops[2].id,
        precio: ruta.precioBase,
        estado: TicketEstado.PAGADO,
        qrCode: randomBytes(16).toString('hex'),
      }
    });

    await prisma.pago.create({
      data: {
        ticketId: ticket.id,
        monto: ticket.precio,
        metodo: PagoMetodo.TARJETA,
        estado: 'COMPLETADO',
        notas: 'Pago generado masivamente',
      }
    });
    
    await prisma.trip.update({
      where: { id: viaje.id },
      data: { asientosOcupados: { increment: 1 } }
    });

    ticketsCreados++;
  }

  console.log(`\n✅ ¡Éxito Total! Se insertaron:`);
  console.log(`- 10 Usuarios (5 Choferes, 5 Pasajeros)`);
  console.log(`- 5 Buses`);
  console.log(`- 5 Rutas con 15 Paradas`);
  console.log(`- 10 Viajes programados`);
  console.log(`- ${ticketsCreados} Tickets con sus Pagos`);
  console.log(`\n📌 Usuarios de prueba:`);
  console.log(`   Pasajeros: DPI 8888800000001 al 8888800000005 (Pass: Password123!)`);
  console.log(`   Choferes: DPI 8888800000006 al 8888800000010 (Pass: Password123!)`);
}

main()
  .catch((e) => {
    console.error('❌ Error insertando:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });