# Credara · Comparador de préstamos online

Sitio público desarrollado con Angular 22. No requiere cuenta ni inicio de sesión.

## Desarrollo

Requiere Node.js compatible con Angular 22. Para usar los datos de demostración sin levantar el backend:

```sh
npm install
npm start
```

Para consultar el backend local en el puerto `8080`:

```sh
npm run start:backend
```

Esta configuración envía `/api` al backend mediante `proxy.conf.json`. El backend debe permitir el origen `http://localhost:4200` mediante `FRONT_URL`.

```sh
npm run build
```

La compilación de producción usa `environment.production.ts`: desactiva los mocks y consulta `/api` en el mismo origen. Al desplegar, configura el servidor web para enviar ese prefijo al backend; el frontend no accede directamente a Firestore.

## Módulos

- `/lenders`: inicio y comparador de entidades.
- `/loan-test`: test de préstamos.
- `/apr-calculator`: calculadora TAE y tabla de costes.
- `/how-it-works`: cómo funciona.
- `/contacto`: contacto.
- `/loan-types`: tipos de préstamo.
- `/articles`: blog de finanzas personales.
- `/loan-simulator`: simulador avanzado.
- `/applications`: solicitud y presentación de ofertas.
- `/about-us`: sobre nosotros y textos legales.

## Conexión con las otras capas

El backend Express escucha en el puerto `8080` y expone los servicios bajo `/api`. En desarrollo, `npm run start:backend` utiliza el proxy local; en producción, `/api` debe dirigirse a ese backend. El backend se conecta a Firestore con `FIREBASE_PROJECT_ID=demo-app` y `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085` durante el desarrollo. El navegador nunca se conecta directamente a la base de datos.
