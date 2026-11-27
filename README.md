# Credara · Comparador de préstamos online

Frontend público desarrollado con Angular 22. No requiere cuenta ni inicio de sesión.

## Desarrollo

Requiere Node.js compatible con Angular 22. Para iniciar la aplicación con respuestas de ejemplo:

```sh
npm install
npm start
```

Para usar el backend local, inicia primero su API en el puerto `8080` y ejecuta:

```sh
npm run start:backend
```

El servidor de desarrollo publica el frontend en `http://localhost:4200` y envía las peticiones `/api` al backend mediante `proxy.conf.json`. El backend debe admitir ese origen mediante `FRONT_URL=http://localhost:4200`.

`npm run build` genera la versión de producción con `useMock: false`. En producción, sirve el frontend y la API bajo el mismo origen para que las peticiones a `/api` lleguen al backend.

## Módulos

- **Inicio y comparador de entidades** (`/lenders`): consulta las entidades y las ofertas destacadas.
- **Simulador avanzado** (`/loan-simulator`): calcula los costes en el navegador.
- **Solicitud de ofertas** (`/applications`): envía la solicitud, consulta ofertas y registra la entidad elegida.
- **Sobre nosotros y textos legales** (`/about-us`): contenido público.

## Conexión con las otras capas

El frontend consume únicamente la API del backend bajo `/api`, en el puerto `8080` durante el desarrollo. No accede directamente a Firestore: el backend se conecta a su emulador en `127.0.0.1:8085` con el proyecto `demo-app`. La configuración del frontend está en los archivos fijos de `src/environments/`; `npm start` usa mocks, mientras que `npm run start:backend` usa el proxy hacia la API.
