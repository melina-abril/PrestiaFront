# Credara · Comparador de préstamos online

Sitio público en Angular 22. No requiere cuenta ni inicio de sesión.

## Desarrollo

Requiere Node.js compatible con Angular 22. Para iniciar con datos de ejemplo, sin backend:

```sh
npm install
npm start
```

La aplicación se sirve en `http://localhost:4200`. Para usar el backend local en vez de los mocks:

```sh
npm run start:backend
```

Este comando usa `environment.backend.ts` y el proxy de `/api` hacia el backend en `http://localhost:8080`. El backend se conecta a Cloud Firestore; en desarrollo puede utilizar el emulador en `127.0.0.1:8085` con el proyecto `demo-app`. Consulta el README de la base de datos para iniciar el emulador y cargar los datos. El frontend no se conecta directamente a Firestore.

```sh
npm run build
```

La compilación de producción utiliza siempre `environment.production.ts`, con mocks desactivados y la API en el mismo origen bajo `/api`. Al desplegar, configura el servidor web para dirigir ese prefijo al backend y servir las rutas de Angular.

## Módulos

- Inicio y comparador de entidades: `/lenders`.
- Tipos de préstamo: `/loan-types`.
- Blog de finanzas personales: `/articles`.
- Simulador avanzado: `/loan-simulator`.
- Solicitud y presentación de ofertas: `/applications`.
- Sobre nosotros y textos legales: `/about-us`.
