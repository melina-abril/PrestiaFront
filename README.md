# Prestia · Simulador de préstamos

Frontend público de Prestia, desarrollado con Angular 22. Esta estructura inicial muestra una página de bienvenida; el simulador y la solicitud se incorporarán en sus módulos. No requiere inicio de sesión.

## Desarrollo

Requiere Node.js y npm. Para iniciar la aplicación con la configuración de desarrollo y mocks:

```sh
npm install
npm start
```

Para conectarla al backend local, inicia primero la API en el puerto 8080 y ejecuta:

```sh
npm run start:backend
```

El proxy de desarrollo envía las solicitudes bajo `/api` al backend en `http://localhost:8080`. El backend permite el origen `http://localhost:4200` mediante `FRONT_URL`. Su única ruta disponible en esta estructura inicial es `GET /api/health`; todavía no hay servicios de funcionalidades que consumir.

## Compilación

```sh
npm run build
```

La compilación usa `environment.production.ts`: desactiva los mocks y espera la API en el mismo origen bajo `/api`. Para desplegar frontend y backend en orígenes distintos, configura la URL de la API y el origen permitido por CORS para ese entorno.

## Módulos

Aún no hay módulos de funcionalidades. La navegación se completará cuando se generen.
