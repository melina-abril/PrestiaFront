# Credara · Comparador de préstamos online

Frontend público en Angular 22. No requiere cuenta ni inicio de sesión.

## Desarrollo

Requiere Node.js y npm. Para usar los datos de demostración, ejecuta:

```sh
npm install
npm start
```

La aplicación se abre en `http://localhost:4200`. Para usar el backend local en lugar de los mocks, levanta primero la API en el puerto `8080` y ejecuta:

```sh
npm run start:backend
```

Esta configuración envía las peticiones `/api` al backend mediante `proxy.conf.json`. Para generar la versión de despliegue:

```sh
npm run build
```

`npm run build` utiliza siempre `environment.production.ts`, con `useMock: false`: espera la API bajo `/api` en el mismo origen. Configura en el backend `FRONT_URL=http://localhost:4200` para permitir el origen de desarrollo cuando sea necesario.

## Módulos

- `/lenders`: inicio, simulación inicial y comparador de entidades.
- `/articulos`: listado y detalle de artículos del blog.
- `/contacto`: formulario de contacto.
- `/loan-requests`: simulador avanzado y solicitud de ofertas.
- `/loan-types`: tipos de préstamo y sus detalles.

## Conexión entre capas

El frontend consume la API pública del backend en el puerto `8080` mediante los endpoints `/api/lenders`, `/api/articulos`, `/api/contacto`, `/api/loan-requests` y `/api/loan-types`. En desarrollo, `npm run start:backend` dirige el prefijo `/api` a `http://localhost:8080`. El backend usa Firestore: para desarrollo local, su emulador escucha en `127.0.0.1:8085` con el proyecto `demo-app`, configurado mediante `FIREBASE_PROJECT_ID` y `FIRESTORE_EMULATOR_HOST`. El frontend no accede directamente a Firestore.
