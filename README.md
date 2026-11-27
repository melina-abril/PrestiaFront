# Credara · Comparador de préstamos online

Sitio público en Angular 22. No requiere cuenta ni inicio de sesión.

## Desarrollo

Requiere Node.js y npm compatibles con Angular 22.

```sh
npm install
npm start
```

`npm start` sirve la aplicación con datos de ejemplo. Para conectarla a la API local, inicia primero el backend en el puerto `8080` y ejecuta:

```sh
npm run start:backend
```

El servidor de desarrollo usa el proxy de `/api` hacia `http://localhost:8080`. El frontend se sirve en `http://localhost:4200`; configura `FRONT_URL=http://localhost:4200` en el backend para permitir ese origen. Para compilar:

```sh
npm run build
```

La compilación de producción usa `environment.production.ts`: los mocks quedan desactivados y las peticiones se hacen al mismo origen bajo `/api`. En el despliegue, dirige ese prefijo al backend.

## Módulos

- `lenders`: inicio con ofertas destacadas y comparador de entidades.
- `loan-simulator`: simulador avanzado, calculado en el navegador.
- `applications`: solicitud y presentación de ofertas.
- `loan-types`: índice y páginas de tipos de préstamo.

## Conexión con las otras capas

El frontend consume los endpoints públicos del backend bajo `/api`: `/api/lenders`, `/api/applications` y `/api/loan-types`. El backend escucha en el puerto `8080` y utiliza Firestore; el frontend no accede directamente a la base. Para el desarrollo local de las tres capas, inicia el emulador de Firestore en `127.0.0.1:8085` con el proyecto `demo-app`, después el backend y por último `npm run start:backend`.
