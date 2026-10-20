\# RutaBus GT - Backend API



API REST y WebSockets para el sistema de transporte de buses en Amatitlán \& Sur.



\##  Tecnologías

\- \*\*NestJS\*\* (TypeScript)

\- \*\*PostgreSQL\*\* + \*\*Prisma ORM\*\*

\- \*\*JWT\*\* (Autenticación)

\- \*\*Socket.io\*\* (Tiempo real)



\##  Cómo levantar el proyecto



1\. Instalar dependencias:

&#x20;  \\`\\`\\`bash

&#x20;  npm install

&#x20;  \\`\\`\\`



2\. Configurar variables de entorno (crear archivo `.env` en la raíz del backend):

&#x20;  \\`\\`\\`env

&#x20;  DATABASE\_URL="postgresql://postgres:TU\_PASSWORD@localhost:5432/rutabus\_db?schema=public"

&#x20;  JWT\_SECRET="rutabus-gt-super-secret-2026"

&#x20;  \\`\\`\\`



3\. Sincronizar base de datos y generar cliente Prisma:

&#x20;  \\`\\`\\`bash

&#x20;  npx prisma migrate dev

&#x20;  npx prisma db seed

&#x20;  \\`\\`\\`



4\. Arrancar el servidor:

&#x20;  \\`\\`\\`bash

&#x20;  npm run start:dev

&#x20;  \\`\\`\\`



\##  Documentación (Swagger)

Una vez corriendo el servidor, abrir en el navegador:

\*\*\[http://localhost:3000/api/docs](http://localhost:3000/api/docs)\*\*



\##  Usuarios de prueba

Contraseña para todos: `RutaBus2026!`

\- \*\*Admin:\*\* DPI `1111111111111`

\- \*\*Chofer:\*\* DPI `2222222222222`

\- \*\*Pasajero:\*\* DPI `4444444444444` (o `5555555555555` con contraseña `Password123!`)



\##  WebSockets (GPS)

Conectar a: `http://localhost:3000/gps`

\- \*\*Emitir:\*\* `update-location` (enviar coordenadas)

\- \*\*Escuchar:\*\* `all-buses` (mapa global) / `bus-location` (mapa específico)

