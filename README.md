# Credara · Comparador de préstamos online

Sitio público desarrollado con Angular 22. No requiere cuenta ni inicio de sesión.

## Desarrollo

Requiere Node.js y npm compatibles con las versiones de Angular indicadas en `package.json`.

```sh
npm install
npm start
```

`npm start` levanta la aplicación en `http://localhost:4200` con datos de muestra. Para usar la API local en lugar de los mocks, arranca primero el backend en el puerto `8080` y ejecuta:

```sh
npm run start:backend
```

Esta configuración envía las solicitudes bajo `/api` al backend mediante `proxy.conf.json`. Para compilar:

```sh
npm run build
```

El build de producción usa `environment.production.ts`, siempre con `useMock: false`, y espera la API bajo `/api` en el mismo origen del sitio. Despliega el frontend detrás de un proxy que dirija ese prefijo al backend.

## Pantallas

- Inicio y comparador de entidades (`lenders`).
- Test de préstamos (`herramientas/test-prestamos`).
- Calculadora TAE (`herramientas/calculadora-tae`).
- Cómo funciona (`como-funciona`).
- Blog y artículos (`blog`).
- Contacto (`contacto`).
- Simulador avanzado (`loan-simulator`).
- Solicitud y presentación de ofertas (`applications`).
- Tipos de préstamo (`loan-types`).

## Conexión con las otras capas

El frontend escucha en el puerto `4200` y consume los endpoints públicos del backend en el puerto `8080`, con el prefijo `/api`. Configura `FRONT_URL=http://localhost:4200` en el backend para permitir el origen del frontend. El backend utiliza Firestore; en desarrollo, su emulador escucha en `127.0.0.1:8085` con el proyecto `demo-app`. El frontend no se conecta directamente a Firestore.
