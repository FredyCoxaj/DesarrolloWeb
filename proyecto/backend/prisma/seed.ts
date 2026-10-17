import { PrismaClient, Role, PncStatus, BusEstado } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log(' Iniciando seed...\n');

  // ============================================
  // 1. USUARIOS
  // ============================================
  const passwordHash = await bcrypt.hash('RutaBus2026!', 10);

  const admin = await prisma.user.upsert({
    where: { dpi: '1111111111111' },
    update: {},
    create: {
      dpi: '1111111111111',
      nombre: 'Admin',
      apellido: 'RutaBus',
      email: 'admin@rutabus.gt',
      telefono: '55551111',
      passwordHash,
      rol: Role.ADMIN,
      pncStatus: PncStatus.VERIFICADO,
      pncVerificadoEn: new Date(),
    },
  });
  console.log(` Admin creado: ${admin.email}`);

  const choferes = await Promise.all([
    prisma.user.upsert({
      where: { dpi: '2222222222222' },
      update: {},
      create: {
        dpi: '2222222222222',
        nombre: 'Carlos',
        apellido: 'López',
        email: 'carlos@rutabus.gt',
        telefono: '55552222',
        passwordHash,
        rol: Role.CHOFER,
        pncStatus: PncStatus.VERIFICADO,
        pncVerificadoEn: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { dpi: '3333333333333' },
      update: {},
      create: {
        dpi: '3333333333333',
        nombre: 'María',
        apellido: 'García',
        email: 'maria@rutabus.gt',
        telefono: '55553333',
        passwordHash,
        rol: Role.CHOFER,
        pncStatus: PncStatus.VERIFICADO,
        pncVerificadoEn: new Date(),
      },
    }),
  ]);
  console.log(`✅ ${choferes.length} choferes creados`);

  const pasajero = await prisma.user.upsert({
    where: { dpi: '4444444444444' },
    update: {},
    create: {
      dpi: '4444444444444',
      nombre: 'Katheryn',
      apellido: 'Fernanda',
      email: 'katheryn@example.com',
      telefono: '55554444',
      passwordHash,
      rol: Role.PASAJERO,
      pncStatus: PncStatus.VERIFICADO,
      pncVerificadoEn: new Date(),
    },
  });
  console.log(` Pasajero creado: ${pasajero.email}`);

  // ============================================
  // 2. BUSES
  // ============================================
  const buses = await Promise.all([
    prisma.bus.upsert({
      where: { placa: 'GTB-001' },
      update: {},
      create: {
        placa: 'GTB-001',
        marca: 'Mercedes-Benz',
        modelo: 'Sprinter',
        anio: 2020,
        capacidad: 40,
        filas: 10,
        columnas: 4,
        estado: BusEstado.ACTIVO,
      },
    }),
    prisma.bus.upsert({
      where: { placa: 'GTB-002' },
      update: {},
      create: {
        placa: 'GTB-002',
        marca: 'Toyota',
        modelo: 'Coaster',
        anio: 2019,
        capacidad: 30,
        filas: 10,
        columnas: 3,
        estado: BusEstado.ACTIVO,
      },
    }),
    prisma.bus.upsert({
      where: { placa: 'GTB-003' },
      update: {},
      create: {
        placa: 'GTB-003',
        marca: 'Hino',
        modelo: 'AK',
        anio: 2021,
        capacidad: 44,
        filas: 11,
        columnas: 4,
        estado: BusEstado.ACTIVO,
      },
    }),
    prisma.bus.upsert({
      where: { placa: 'GTB-004' },
      update: {},
      create: {
        placa: 'GTB-004',
        marca: 'Isuzu',
        modelo: 'Journey',
        anio: 2018,
        capacidad: 40,
        filas: 10,
        columnas: 4,
        estado: BusEstado.MANTENIMIENTO,
      },
    }),
  ]);
  console.log(` ${buses.length} buses creados`);

  // ============================================
  // 3. RUTAS DE AMATITLÁN & SUR
  // ============================================
  const rutas = [
    {
      nombre: 'Amatitlán Centro → Zona 12',
      descripcion: 'Ruta principal hacia la capital',
      origen: 'Amatitlán Centro',
      destino: 'Zona 12, Guatemala',
      precioBase: 15.0,
      duracionMin: 60,
      color: '#1E3A8A',
      stops: [
        { nombre: 'Amatitlán Centro', lat: 14.4771, lng: -90.6346, orden: 1, esTerminal: true },
        { nombre: 'Mercado Amatitlán', lat: 14.4795, lng: -90.6320, orden: 2 },
        { nombre: 'Puente Amatitlán', lat: 14.4820, lng: -90.6280, orden: 3 },
        { nombre: 'Villa Nueva Centro', lat: 14.5264, lng: -90.5875, orden: 4 },
        { nombre: 'Centra Sur', lat: 14.5610, lng: -90.5790, orden: 5, esTerminal: true },
      ],
    },
    {
      nombre: 'Amatitlán → Villa Nueva → Mixco',
      descripcion: 'Ruta al occidente',
      origen: 'Amatitlán',
      destino: 'Mixco',
      precioBase: 20.0,
      duracionMin: 90,
      color: '#10B981',
      stops: [
        { nombre: 'Amatitlán Centro', lat: 14.4771, lng: -90.6346, orden: 1, esTerminal: true },
        { nombre: 'San Miguel Petapa', lat: 14.5050, lng: -90.5630, orden: 2 },
        { nombre: 'Villa Nueva', lat: 14.5264, lng: -90.5875, orden: 3 },
        { nombre: 'Mixco Centro', lat: 14.6340, lng: -90.6067, orden: 4, esTerminal: true },
      ],
    },
    {
      nombre: 'Amatitlán → San Miguel Petapa',
      descripcion: 'Ruta corta intermunicipal',
      origen: 'Amatitlán Centro',
      destino: 'San Miguel Petapa',
      precioBase: 10.0,
      duracionMin: 30,
      color: '#F59E0B',
      stops: [
        { nombre: 'Amatitlán Centro', lat: 14.4771, lng: -90.6346, orden: 1, esTerminal: true },
        { nombre: 'Colonia El Carmen', lat: 14.4890, lng: -90.6100, orden: 2 },
        { nombre: 'San Miguel Petapa Centro', lat: 14.5050, lng: -90.5630, orden: 3, esTerminal: true },
      ],
    },
    {
      nombre: 'Ruta Interna Amatitlán',
      descripcion: 'Recorrido urbano dentro del municipio',
      origen: 'Amatitlán Centro',
      destino: 'Hospital Amatitlán',
      precioBase: 5.0,
      duracionMin: 20,
      color: '#8B5CF6',
      stops: [
        { nombre: 'Parque Central', lat: 14.4771, lng: -90.6346, orden: 1, esTerminal: true },
        { nombre: 'Mercado Municipal', lat: 14.4795, lng: -90.6320, orden: 2 },
        { nombre: 'Colonia El Rosario', lat: 14.4810, lng: -90.6250, orden: 3 },
        { nombre: 'Hospital Amatitlán', lat: 14.4830, lng: -90.6180, orden: 4, esTerminal: true },
      ],
    },
  ];

  for (const rutaData of rutas) {
    const { stops, ...rutaInfo } = rutaData;
    const existente = await prisma.route.findFirst({ where: { nombre: rutaInfo.nombre } });
    if (!existente) {
      const ruta = await prisma.route.create({
        data: {
          ...rutaInfo,
          stops: {
            create: stops.map((s) => ({
              nombre: s.nombre,
              latitud: s.lat,
              longitud: s.lng,
              orden: s.orden,
              esTerminal: s.esTerminal ?? false,
            })),
          },
        },
      });
      console.log(` Ruta creada: ${ruta.nombre}`);
    } else {
      console.log(`  Ruta ya existe: ${existente.nombre}`);
    }
  }

  // ============================================
  // 4. VIAJES DE EJEMPLO
  // ============================================
  const rutaPrincipal = await prisma.route.findFirst({
    where: { nombre: 'Amatitlán Centro → Zona 12' },
  });
  const busActivo = await prisma.bus.findFirst({ where: { placa: 'GTB-001' } });

  if (rutaPrincipal && busActivo) {
    const viajeExistente = await prisma.trip.findFirst({
      where: { routeId: rutaPrincipal.id, choferId: choferes[0].id },
    });
    if (!viajeExistente) {
      const ahora = new Date();
      await prisma.trip.create({
        data: {
          routeId: rutaPrincipal.id,
          busId: busActivo.id,
          choferId: choferes[0].id,
          fechaSalida: new Date(ahora.getTime() + 30 * 60 * 1000), // en 30 min
          estado: 'PROGRAMADO',
        },
      });
      console.log(' Viaje de ejemplo creado');
    }
  }

  console.log('\n Seed completado exitosamente\n');
  console.log(' Credenciales de prueba (contraseña: RutaBus2026!):');
  console.log('   Admin:    admin@rutabus.gt     (DPI: 1111111111111)');
  console.log('   Chofer:   carlos@rutabus.gt    (DPI: 2222222222222)');
  console.log('   Chofer:   maria@rutabus.gt     (DPI: 3333333333333)');
  console.log('   Pasajero: katheryn@example.com (DPI: 4444444444444)\n');
}

main()
  .catch((e) => {
    console.error(' Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });