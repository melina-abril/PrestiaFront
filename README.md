# Credara · Comparador de préstamos online

Frontend público en Angular. No requiere cuenta ni inicio de sesión.

## Desarrollo

Requiere Node.js y npm. Para iniciar con datos de ejemplo, sin backend:

```sh
npm install
npm start
```

Para consumir la API local, levanta el backend en el puerto `8080` y ejecuta:

```sh
npm run start:backend
```

El frontend escucha en `http://localhost:4200`. Su proxy envía las peticiones `/api` a `http://localhost:8080`. Configura `FRONT_URL=http://localhost:4200` en el backend para permitir ese origen.

```sh
npm run build
```

La compilación de producción usa siempre `environment.production.ts`, con mocks desactivados y la API bajo `/api` en el mismo origen. Configura el servidor de despliegue para dirigir ese prefijo al backend.

## Módulos

- Inicio y comparador de entidades: `/lenders`.
- Blog: `/blog`.
- Contacto: `/contacto`.
- Simulador avanzado y solicitud de ofertas: `/loan-requests`.
- Tipos de préstamo: `/loan-types`.

## Conexión entre capas

El frontend consume únicamente la API pública del backend mediante `/api`; no se conecta directamente a Firestore. El backend utiliza el proyecto `demo-app` y, en desarrollo, el emulador de Firestore en `127.0.0.1:8085`. Consulta las instrucciones de la base de datos para levantar el emulador y cargar sus documentos antes de usar `npm run start:backend`.
