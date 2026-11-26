# Credara · Comparador de préstamos online

Frontend público en Angular 22. No requiere cuenta ni inicio de sesión.

## Desarrollo

Requiere Node.js y npm. Instala las dependencias y levanta la aplicación en `http://localhost:4200`:

```sh
npm install
npm start
```

`npm start` usa las respuestas de ejemplo configuradas para desarrollo. Para consultar la API real, levanta primero el backend en el puerto `8080` y ejecuta:

```sh
npm run start:backend
```

Esta configuración usa el proxy de desarrollo: las peticiones a `/api` van a `http://localhost:8080`. El backend debe permitir el origen `http://localhost:4200` mediante `FRONT_URL`. Los endpoints consumidos incluyen `/api/lenders`, `/api/loan-requests` y `/api/loan-types`; el frontend no se conecta directamente a Firestore.

## Compilación

```sh
npm run build
```

La compilación de producción usa siempre `environment.production.ts`, con `useMock: false` y la API bajo `/api` en el mismo origen. Al desplegar el frontend, publica la API en ese prefijo o configura un proxy equivalente hacia el backend.

## Módulos

- **Inicio y comparador de entidades** (`/lenders`): simulador inicial, entidades destacadas y comparador.
- **Simulador avanzado y solicitud de ofertas** (`/loan-requests`): cálculo del préstamo, solicitud y consulta de ofertas.
- **Tipos de préstamo** (`/loan-types`): índice y páginas de detalle de los tipos disponibles.

## Conexión entre capas

El backend Express escucha en `8080` y permite el origen del frontend mediante `FRONT_URL=http://localhost:4200`. En desarrollo, su conexión a Firestore utiliza `FIREBASE_PROJECT_ID=demo-app` y `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085`. El emulador escucha en `8085`; solo el backend accede a él.
