# Credara · Comparador de préstamos online

Frontend público en Angular 22. Esta primera estructura muestra una página de bienvenida; la navegación y las pantallas de las funcionalidades se incorporarán al generar sus módulos. No requiere cuenta ni inicio de sesión.

## Desarrollo

Requiere Node.js y npm. Para instalar las dependencias y levantar el frontend en `http://localhost:4200`:

```sh
npm install
npm start
```

`npm start` usa la configuración de desarrollo con mocks. Para usar la API local, levanta el backend por separado en el puerto `8080` y ejecuta:

```sh
npm run start:backend
```

El proxy de desarrollo envía las peticiones con prefijo `/api` a `http://localhost:8080`. El backend debe permitir el origen `http://localhost:4200` mediante `FRONT_URL`. La API usa Firestore; para desarrollo local, su emulador escucha en `127.0.0.1:8085` con el proyecto `demo-app`. El frontend no accede directamente a Firestore.

## Compilación

```sh
npm run build
```

La compilación de producción utiliza `environment.production.ts`: desactiva los mocks y consulta la API bajo `/api` en el mismo origen. El servidor que publique la aplicación debe dirigir ese prefijo al backend.

## Módulos

Todavía no hay módulos funcionales generados. La ruta inicial muestra únicamente la bienvenida de esta estructura base.
