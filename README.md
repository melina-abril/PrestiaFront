# Prestia · Simulador de préstamos

Sitio público para simular préstamos y completar una solicitud en pasos. No requiere iniciar sesión.

## Desarrollo

Requiere Node.js y npm. Para usar los datos de ejemplo sin iniciar el backend:

```sh
npm install
npm start
```

Para conectar con la API local, inicia primero el emulador de Firestore y el backend según sus respectivos README. Luego ejecuta:

```sh
npm run start:backend
```

El frontend se sirve en `http://localhost:4200`. La configuración `backend` desactiva los mocks y envía las peticiones bajo `/api` mediante el proxy de desarrollo a `http://localhost:8080`. El backend permite el origen del frontend mediante `FRONT_URL=http://localhost:4200`; en desarrollo usa `FIREBASE_PROJECT_ID=demo-app` y `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085` para conectarse al emulador de la base de datos. El frontend no accede directamente a Firestore.

## Compilación

```sh
npm run build
```

La compilación utiliza siempre la configuración de producción: mocks desactivados y API en el mismo origen bajo `/api`. El despliegue debe dirigir ese prefijo al backend.

## Módulos

- **Simulador y solicitud de préstamos** (`/loan-applications`): simulación pública, solicitud en pasos y consulta de ofertas. Consume `POST /api/loan-applications` y `GET /api/loan-applications/:id/offers`.
