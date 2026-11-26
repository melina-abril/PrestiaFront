# Credara · Comparador de préstamos online

Estructura inicial del sitio público en Angular. Todavía no hay módulos funcionales: la ruta principal muestra una página de bienvenida y la navegación está vacía.

## Desarrollo

Requiere Node.js compatible con Angular 22 y npm.

```sh
npm install
npm start
```

`npm start` utiliza la configuración de desarrollo con mocks. Cuando existan endpoints funcionales en la API local, puedes ejecutar el frontend contra ella:

```sh
npm run start:backend
```

Esta configuración usa el proxy de `/api` hacia `http://localhost:8080`. Por ahora, el backend solo expone `GET /api/health`; no hay servicios funcionales que consumir.

```sh
npm run build
```

El build utiliza siempre `environment.production.ts`, sin mocks y con la API bajo `/api` en el mismo origen. Al desplegar las capas por separado, configura el servidor público para dirigir ese prefijo al backend en el puerto 8080 y servir el frontend desde un origen permitido por `FRONT_URL` en el backend. La base Firestore funciona detrás del backend; el frontend no se conecta directamente a ella.

## Módulos

Todavía no hay módulos funcionales.
