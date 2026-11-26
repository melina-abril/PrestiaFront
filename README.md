# Credara · Comparador de préstamos online

Sitio público Angular 22. No requiere cuenta ni inicio de sesión.

## Desarrollo

Requiere Node.js y npm. Para abrir la aplicación con datos de ejemplo, sin levantar el backend:

```sh
npm install
npm start
```

Para trabajar con la API local, levanta primero el backend en el puerto `8080` y ejecuta:

```sh
npm run start:backend
```

El frontend se sirve en `http://localhost:4200`. Su proxy envía las solicitudes `/api` al backend en `http://localhost:8080`; este permite el origen del frontend mediante `FRONT_URL=http://localhost:4200`. El backend se conecta a Firestore, que en desarrollo utiliza el emulador en `127.0.0.1:8085` con el proyecto `demo-app`. El frontend nunca accede directamente a Firestore.

## Compilación

```sh
npm run build
```

La compilación de producción usa `environment.production.ts`: desactiva los mocks y llama a la API bajo `/api` en el mismo origen. Para desplegarla en otro origen, configura el encaminamiento de `/api` hacia el backend.

## Módulos

- `lenders`: inicio con ofertas destacadas y comparador de entidades.
- `loan-requests`: simulador avanzado y solicitud de ofertas.
- `loan-types`: índice y páginas de tipos de préstamo.

Las pantallas consumen exclusivamente los endpoints públicos `/api/lenders`, `/api/loan-requests` y `/api/loan-types` del backend. El backend escucha en el puerto `8080`; la base Firestore y sus datos se preparan por separado antes de usar el modo conectado.
