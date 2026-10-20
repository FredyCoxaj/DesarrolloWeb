import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const logger = new Logger('Bootstrap');
    // Prefijo global de la API
    app.setGlobalPrefix('api');
    // CORS para el frontend Angular
    app.enableCors({
        origin: ['http://localhost:4200', 'http://localhost:3000'],
        credentials: true,
    });
    // Validación automática de DTOs
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    // ============================================
    // SWAGGER / OPENAPI
    // ============================================
    const swaggerConfig = new DocumentBuilder()
        .setTitle('RutaBus GT API')
        .setDescription('API REST para el sistema de transporte de buses en Amatitlán & Sur.')
        .setVersion('0.1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Token JWT obtenido en /api/auth/login',
        in: 'header',
    }, 'JWT-auth')
        .addTag('Auth', 'Autenticación y registro con DPI')
        .addTag('Users', 'Gestión de usuarios (admin)')
        .addTag('Routes', 'Rutas y paradas')
        .addTag('Buses', 'Flota de buses')
        .addTag('Trips', 'Viajes programados y en curso')
        .addTag('Tickets', 'Boletos, reserva de asientos y QR')
        .addTag('Payments', 'Pagos: efectivo, tarjeta y banco')
        .addTag('Admin', 'Dashboard y reportes administrativos')
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
        },
        customSiteTitle: 'RutaBus GT API Docs',
    });
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    logger.log(` RutaBus GT API corriendo en: http://localhost:${port}/api`);
    logger.log(` Health check: http://localhost:${port}/api/health`);
    logger.log(` Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
