# Prestia · Simulador de préstamos

Frontend público desarrollado con Angular 22. Esta estructura inicial no incluye todavía pantallas de funcionalidades; las rutas y la navegación se ampliarán al incorporar los módulos.

## Desarrollo

Requiere Node.js y npm. Para iniciar la aplicación con la configuración de desarrollo y mocks:

```sh
npm install
npm start
```

La aplicación estará disponible en `http://localhost:4200`. Para conectarla al backend local, inicia primero su API y el emulador de Firestore y ejecuta:

```sh
npm run start:backend
```

La configuración `backend` utiliza el proxy de `/api` hacia `http://localhost:8080`. `npm run build` genera la versión de producción con `environment.production.ts`: desactiva los mocks y consume `/api` en el mismo origen donde se despliegue el frontend.

## Módulos

Todavía no se han incorporado módulos de funcionalidades.

## Conexión con las otras capas

El frontend se ejecuta en el puerto `4200` y consume la API pública del backend bajo `/api`, sin inicio de sesión. En desarrollo, el proxy envía esas peticiones al backend del puerto `8080`; configura allí `FRONT_URL=http://localhost:4200` para permitir este origen. El backend se conecta al emulador de Firestore mediante `FIREBASE_PROJECT_ID=demo-app` y `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085`. El frontend no accede directamente a la base de datos.
