# Prestia · Simulador de préstamos

Frontend público desarrollado con Angular 22. No requiere inicio de sesión.

## Desarrollo

Requiere Node.js y npm. Instala las dependencias y levanta la aplicación en `http://localhost:4200`:

```sh
npm install
npm start
```

`npm start` usa los datos de ejemplo de la configuración de desarrollo. Para consultar el backend local, inicia primero su API en el puerto `8080` y ejecuta:

```sh
npm run start:backend
```

El proxy de desarrollo envía las peticiones `/api` al backend en `http://localhost:8080`. La API utiliza Firestore; para trabajar con datos persistidos, inicia antes el emulador del proyecto `demo-app` en `127.0.0.1:8085` y carga sus datos de ejemplo siguiendo el README de la base de datos. El origen del frontend para CORS es `http://localhost:4200`, configurado en el backend mediante `FRONT_URL`.

## Compilación

```sh
npm run build
```

La compilación de producción usa siempre el backend, sin mocks, mediante la configuración fija `environment.production.ts`. En producción, sirve el frontend con la API disponible bajo `/api` en el mismo origen.

## Módulos

- **Simulador y solicitud de préstamos** (`/loan-applications`): landing con simulador y solicitud en pasos que muestra las ofertas. Consume `POST /api/loan-applications` y `GET /api/loan-applications/:id/offers`.

El frontend no se conecta directamente a Firestore: todas las solicitudes de datos pasan por el backend.
