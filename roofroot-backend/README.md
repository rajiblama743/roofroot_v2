# RoofRoot Backend

This is the backend service for the RoofRoot real estate platform, built with Node.js, Express, TypeScript, and MongoDB.

---

## User Authentication

- JWT-based authentication for secure API access.
- Endpoints:
  - `POST /api/auth/register` — Register a new user (customer)
  - `POST /api/auth/login` — Login and receive JWT token
- Use the `Authorization: Bearer <token>` header for protected routes.

**Example:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

---

## Property Model

Defines the schema for real estate properties in MongoDB.

**Example (Mongoose Schema):**
```ts
const propertySchema = new Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  address: String,
  images: [String],
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

---

## API Routes

- **Auth Routes:**
  - `POST /api/auth/register` — Register user
  - `POST /api/auth/login` — Login
- **User Routes:**
  - `GET /api/users/:id` — Get user profile (protected)
  - `PUT /api/users/:id` — Update user profile (protected)
- **Property Routes:**
  - `POST /api/properties` — Create property (protected)
  - `GET /api/properties` — List all properties
  - `GET /api/properties/:id` — Get property by ID
  - `PUT /api/properties/:id` — Update property (owner only)
  - `DELETE /api/properties/:id` — Delete property (owner only)

---

## Validation Middleware

- Uses `express-validator` for request validation.
- Ensures required fields and correct formats for all endpoints.

**Example:**
```ts
import { body } from 'express-validator';

export const validateProperty = [
  body('title').notEmpty().withMessage('Title is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  // ...other validations
];
```

---

For more details, see the full API documentation in `USER_API.md`. 