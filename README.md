# Credara · Comparador de préstamos online

Frontend público en Angular 22. Esta estructura inicial aún no incluye módulos de funcionalidades ni requiere inicio de sesión.

## Desarrollo

```sh
npm install
npm start
```

`npm start` usa datos simulados. Cuando esté disponible el backend local, arráncalo por separado y ejecuta `npm run start:backend`: el proxy incluido dirige las peticiones `/api` a `http://localhost:8080`.

```sh
npm run build
```

La compilación de producción usa `environment.production.ts`, desactiva los mocks y espera la API bajo `/api` en el mismo origen.

## Conexión con otras capas

El frontend se conecta únicamente al backend HTTP; no accede directamente a Firestore. La base de datos de la otra capa usa Firestore y, en desarrollo, su emulador escucha en `127.0.0.1:8085` con el proyecto `demo-app`. El backend deberá conectarse a él mediante `FIREBASE_PROJECT_ID`, `FIRESTORE_EMULATOR_HOST` y `GCLOUD_PROJECT`.

## Módulos

Todavía no hay módulos de funcionalidades. La ruta inicial muestra una página de bienvenida provisional.
