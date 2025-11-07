## Descripción

Recipes API - Una aplicación NestJS para gestionar recetas médicas con autenticación de Firebase.

## Características

- 🔐 **Autenticación Firebase** - Endpoints seguros con tokens de Firebase Auth
- 📋 **Gestión de Recetas** - Recuperar recetas médicas
- 🔍 **Filtrado Flexible** - Filtrar por nombre de medicamento y rango de fechas de emisión
- 🚀 **API RESTful** - Endpoints REST limpios y simples
- 💉 **Inyección de Dependencias** - Construido con las mejores prácticas de NestJS
- 🎲 **Datos Semilla con Faker** - 200 recetas de aspecto realista generadas al inicio

## Endpoints de la API

Todos los endpoints requieren autenticación de Firebase (token Bearer en el encabezado de autorización).

### Recetas

- **GET /recipes** - Obtener recetas paginadas generadas con Faker (soporta `page`, `limit`, `medicationName`, `startDate`, `endDate`)

#### Parámetros de Consulta

- `page` _(opcional, predeterminado: 1)_ – Número de página (basado en 1)
- `limit` _(opcional, predeterminado: 10)_ – Elementos por página (1-200)
- `medicationName` _(opcional)_ – Coincidencia de subcadena insensible a mayúsculas contra el nombre del medicamento
- `startDate` _(opcional)_ – Cadena de fecha ISO-8601 (límite inferior inclusivo para `issuedAt`)
- `endDate` _(opcional)_ – Cadena de fecha ISO-8601 (límite superior inclusivo para `issuedAt`)

#### Forma de respuesta de GET /recipes

```json
{
  "data": [
    /* Recipe[] */
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

### Objeto Recipe

```typescript
{
  id: string; // UUID generado automáticamente
  patientId: string;
  medication: string;
  issuedAt: Date;
  doctor: string;
  notes: string;
}
```

## Instrucciones de Configuración

### 1. Instalar Dependencias

```bash
yarn install
```

### 2. Configuración de Autenticación Firebase

#### 1. Obtener Credenciales de Firebase

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Configuración del Proyecto** (ícono de engranaje) > **Cuentas de Servicio**
4. Haz clic en **Generar Nueva Clave Privada**
5. Descarga el archivo JSON

### 2. Colocar el Archivo de Cuenta de Servicio

1. Renombra el archivo JSON descargado a `firebase-service-account.json`.
2. Muévelo a la raíz del proyecto (misma carpeta que `package.json`).
3. Mantenlo **fuera del control de versiones**. Agrega el nombre del archivo a `.gitignore` si aún no está ignorado.

El backend carga automáticamente las credenciales desde `firebase-service-account.json` al inicio. No se necesitan variables de entorno.

### 3. Cómo Funciona la Autenticación

Todos los endpoints `/recipes` están protegidos con autenticación de Firebase:

- **GET /recipes** - Obtener recetas paginadas generadas con Faker (soporta `page`, `limit`, `medicationName`, `startDate`, `endDate`)

### 4. Realizar Solicitudes Autenticadas

Tu aplicación necesita incluir el token de ID de Firebase en el encabezado de autorización.

## Configuración del Proyecto

```bash
$ yarn install
```

## Compilar y ejecutar el proyecto

```bash
# desarrollo
$ yarn run start

# modo observación
$ yarn run start:dev

# modo producción
$ yarn run start:prod
```

La API estará disponible en `http://localhost:3000`

## Ejemplos de Uso

### Desde Tu Aplicación (con Firebase Auth)

```javascript
// Obtener el token de ID de Firebase
const idToken = await firebase.auth().currentUser.getIdToken();

// Obtener recetas paginadas
const recipesResponse = await fetch(
  'http://localhost:3000/recipes?page=2&limit=20&medicationName=statin&startDate=2025-01-01&endDate=2025-06-30',
  {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  },
);

const { data, total, page, limit, totalPages } = await recipesResponse.json();

// data es un array de 20 recetas generadas con Faker.js
// filtradas a medicamentos que contienen "statin" emitidas entre Ene-Jun 2025
```

### Pruebas con cURL

```bash
# Obtener recetas filtradas
curl -X GET "http://localhost:3000/recipes?page=1&limit=10&medicationName=statin&startDate=2025-01-01&endDate=2025-06-30" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

## Ejecutar pruebas

```bash
# pruebas unitarias
$ yarn run test

# cobertura de pruebas
$ yarn run test:cov
```

## Licencia

Nest tiene [licencia MIT](https://github.com/nestjs/nest/blob/master/LICENSE).
