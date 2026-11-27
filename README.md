# Credara · Comparador de préstamos online

Sitio público desarrollado con Angular 22. No requiere cuenta ni inicio de sesión.

## Desarrollo

Requiere Node.js compatible con Angular 22. Para iniciar la aplicación con los datos de demostración del entorno de desarrollo:

```sh
npm install
npm start
```

Para usar la API local, inicia el backend en el puerto `8080` y ejecuta:

```sh
npm run start:backend
```

El proxy de desarrollo envía las solicitudes `/api` al backend. La compilación de producción siempre utiliza `environment.production.ts`, con `useMock: false`, y espera la API bajo `/api` en el mismo origen:

```sh
npm run build
```

## Pantallas

- Inicio y comparador de entidades: `/lenders`.
- Sobre nosotros: `/sobre-nosotros`; textos legales: `/legal/{texto}`.
- Test de préstamos: `/herramientas/test-prestamos`.
- Calculadora TAE: `/herramientas/calculadora-tae`.
- Cómo funciona: `/como-funciona`.
- Blog: `/blog`.
- Contacto: `/contacto`.
- Simulador avanzado: `/loan-simulator`.
- Solicitud de ofertas: `/applications`.
- Tipos de préstamo: `/loan-types`.

## Conexión con otras capas

El frontend sirve en `http://localhost:4200` y llama exclusivamente a la API pública del backend, que escucha en el puerto `8080` con el prefijo `/api`. Configura `FRONT_URL=http://localhost:4200` en el backend para permitir ese origen. El backend utiliza Firestore; para desarrollo, su emulador escucha en `127.0.0.1:8085` con el proyecto `demo-app` y las variables `FIREBASE_PROJECT_ID` y `FIRESTORE_EMULATOR_HOST`. El frontend no se conecta directamente a Firestore.
