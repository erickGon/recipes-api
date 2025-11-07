## Description

Recipes API - A NestJS application for managing medical prescriptions (recipes) with Firebase Authentication.

## Features

- 🔐 **Firebase Authentication** - Secure endpoints with Firebase Auth tokens
- 📋 **Recipe Management** - Retrieve medical prescriptions
- 🔍 **Flexible Filtering** - Filter by medication name and issued date range
- 🚀 **RESTful API** - Clean and simple REST endpoints
- 💉 **Dependency Injection** - Built with NestJS best practices
- 🎲 **Seed Data via Faker** - 100 realistic-looking recipes generated at startup

## API Endpoints

All endpoints require Firebase Authentication (Bearer token in Authorization header).

### Recipes

- **GET /recipes** - Get paginated prescriptions seeded with Faker (supports `page`, `limit`, `medicationName`, `startDate`, `endDate`)

#### Query Parameters

- `page` _(optional, default: 1)_ – Page number (1-based)
- `limit` _(optional, default: 10)_ – Items per page (1-100)
- `medicationName` _(optional)_ – Case-insensitive substring match against medication name
- `startDate` _(optional)_ – ISO-8601 date string (inclusive lower bound for `issuedAt`)
- `endDate` _(optional)_ – ISO-8601 date string (inclusive upper bound for `issuedAt`)

#### GET /recipes response shape

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

### Recipe Object

```typescript
{
  id: string; // Auto-generated UUID
  patientId: string;
  medication: string;
  issuedAt: Date;
  doctor: string;
  notes: string;
}
```

## Setup Instructions

### 1. Install Dependencies

```bash
yarn install
```

### 2. Firebase Authentication Setup

#### 1. Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon) > **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file

### 2. Place the Service Account File

1. Rename the downloaded JSON file to `firebase-service-account.json`.
2. Move it to the root of the project (same folder as `package.json`).
3. Keep it **out of version control**. Add the filename to `.gitignore` if it is not already ignored.

The backend automatically loads credentials from `firebase-service-account.json` at startup. No environment variables are needed.

### 3. How the Authentication Works

All `/recipes` endpoints are now protected with Firebase Authentication:

- **GET /recipes** - Get paginated recipes generated with Faker (supports `page`, `limit`, `medicationName`, `startDate`, `endDate`)

### 4. Making Authenticated Requests

Your app needs to include the Firebase ID token in the Authorization header.

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

The API will be available at `http://localhost:3000`

## Usage Examples

### From Your App (with Firebase Auth)

```javascript
// Get the Firebase ID token
const idToken = await firebase.auth().currentUser.getIdToken();

// Get paginated recipes
const recipesResponse = await fetch(
  'http://localhost:3000/recipes?page=2&limit=20&medicationName=statin&startDate=2025-01-01&endDate=2025-06-30',
  {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  },
);

const { data, total, page, limit, totalPages } = await recipesResponse.json();

// data is an array of 20 recipes generated with Faker.js
// filtered to medications containing "statin" issued between Jan-Jun 2025
```

### Testing with cURL

```bash
# Get filtered recipes
curl -X GET "http://localhost:3000/recipes?page=1&limit=10&medicationName=statin&startDate=2025-01-01&endDate=2025-06-30" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

## Run tests

```bash
# unit tests
$ yarn run test

# test coverage
$ yarn run test:cov
```

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
