# Credara · Comparador de préstamos online

Frontend público desarrollado con Angular 22. Esta estructura inicial muestra una página de bienvenida; los módulos de las funcionalidades se incorporarán después.

## Desarrollo

Requiere Node.js compatible con Angular 22.

```sh
npm install
npm start
```

`npm start` utiliza la configuración de desarrollo con mocks. Para conectar el frontend con la API local, inicia el backend por separado y ejecuta:

```sh
npm run start:backend
```

El frontend escucha en `http://localhost:4200`. Su proxy envía las peticiones bajo `/api` al backend en `http://localhost:8080`; no accede directamente a Firestore. El backend usa el proyecto `demo-app` y el emulador de Firestore en `127.0.0.1:8085` durante el desarrollo. Consulta el README de la base de datos para iniciar y cargar ese emulador. Configura `FRONT_URL=http://localhost:4200` en el backend para permitir el origen del frontend.

```sh
npm run build
```

La compilación de producción utiliza `environment.production.ts`: desactiva los mocks y llama a la API bajo `/api` en el mismo origen. El despliegue debe dirigir ese prefijo al backend. No se requiere inicio de sesión.

## Módulos

Todavía no hay módulos de funcionalidades en esta estructura inicial.
