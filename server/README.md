# Gym Website CMS - Server Documentation

A Node.js Express backend for a gym website CMS featuring a RESTful API for admin operations and EJS templates for the public-facing site.

## Development scripts

```bash
# Seed initial data (optional)
npm run seed

# Start development server
npm run dev

# Reset the migrations and uploads 
npm run reset
```

The server runs at http://localhost:3000

## Project Structure

```

server/
├── app.js                  # Express application setup
├── server.js               # Server entry point
├── config/                 # Configuration files
├── controllers/            # Request handlers
├── services/               # Business logic layer
├── middleware/             # Custom middleware
│   └── validators/         # Joi validation schemas
├── routes/
│   ├── api/                # RESTful API routes
│   └── views/              # Public site routes (EJS)
├── data/                   # JSON stprage state
├── DB/                     # Database migrations and helpers
├── errors/                 # Custom error classes
├── utils/                  # Utility functions
├── views/                  # EJS templates
├── public/                 # Static assets
├── uploads/                # Uploaded files
├── logs/                   # Application logs
├── __tests__/              # Jest test suites
├── .env.example            # Environment template
├── .env.development        # Development config
├── .env.production         # Production config
└── .env.test               # Test config
```

## Authentication System

- **JWT-based** with access and refresh tokens
- **HTTP-only cookies** for secure token storage
- **Single admin user** system (credentials in environment variables)
- **Token refresh** on access token expiration

### Auth Flow

1. Admin logs in with username/password
2. Server validates credentials and issues JWT tokens
3. Access token (short-lived) for API requests
4. Refresh token (long-lived) for obtaining new access tokens
5. Tokens stored in HTTP-only cookies (not accessible via JavaScript)

## Data Management

- **SQLite database** for structured data
- **Storage state file** in `data/` directory for
- **Multer** for file upload handling
- **Admin action logging** for audit trail

## API Endpoints

### Authentication

| Method | Endpoint              | Description          |
| ------ | --------------------- | -------------------- |
| POST   | `/api/auth/login`   | Admin login          |
| POST   | `/api/auth/logout`  | Admin logout         |
| POST   | `/api/auth/refresh` | Refresh access token |

### Dashboard

| Method | Endpoint                      | Description          |
| ------ | ----------------------------- | -------------------- |
| GET    | `/api/admin/dashboard`      | Dashboard statistics |
| GET    | `/api/admin/dashboard/logs` | Admin activity logs  |

### Classes

| Method | Endpoint                   | Description     |
| ------ | -------------------------- | --------------- |
| GET    | `/api/admin/classes`     | Get all classes |
| POST   | `/api/admin/classes`     | Create class    |
| PUT    | `/api/admin/classes/:id` | Update class    |
| DELETE | `/api/admin/classes/:id` | Delete class    |

### Trainers

| Method | Endpoint                    | Description      |
| ------ | --------------------------- | ---------------- |
| GET    | `/api/admin/trainers`     | Get all trainers |
| POST   | `/api/admin/trainers`     | Create trainer   |
| PUT    | `/api/admin/trainers/:id` | Update trainer   |
| DELETE | `/api/admin/trainers/:id` | Delete trainer   |

### Events

| Method | Endpoint                  | Description    |
| ------ | ------------------------- | -------------- |
| GET    | `/api/admin/events`     | Get all events |
| POST   | `/api/admin/events`     | Create event   |
| PUT    | `/api/admin/events/:id` | Update event   |
| DELETE | `/api/admin/events/:id` | Delete event   |

### Reviews (Testimonials)

| Method | Endpoint                        | Description     |
| ------ | ------------------------------- | --------------- |
| GET    | `/api/admin/testimonials`     | Get all reviews |
| POST   | `/api/admin/testimonials`     | Create review   |
| PUT    | `/api/admin/testimonials/:id` | Update review   |
| DELETE | `/api/admin/testimonials/:id` | Delete review   |

### Transformations

| Method | Endpoint                          | Description             |
| ------ | --------------------------------- | ----------------------- |
| GET    | `/api/admin/transformation`     | Get all transformations |
| POST   | `/api/admin/transformation`     | Create transformation   |
| PUT    | `/api/admin/transformation/:id` | Update transformation   |
| DELETE | `/api/admin/transformation/:id` | Delete transformation   |

### Gallery

| Method | Endpoint                                    | Description                    |
| ------ | ------------------------------------------- | ------------------------------ |
| GET    | `/api/admin/gallery`                      | Get all categories with images |
| POST   | `/api/admin/gallery`                      | Create category                |
| PUT    | `/api/admin/gallery/:id`                  | Update category                |
| DELETE | `/api/admin/gallery/:id`                  | Delete category                |
| POST   | `/api/admin/gallery/:id/images`           | Add image to category          |
| DELETE | `/api/admin/gallery/:catId/images/:imgId` | Delete image                   |

### Schedule

| Method | Endpoint                    | Description       |
| ------ | --------------------------- | ----------------- |
| GET    | `/api/admin/schedule`     | Get full schedule |
| POST   | `/api/admin/schedule`     | Add session       |
| PUT    | `/api/admin/schedule/:id` | Update session    |
| DELETE | `/api/admin/schedule/:id` | Delete session    |

### Pricing

| Method | Endpoint                   | Description   |
| ------ | -------------------------- | ------------- |
| GET    | `/api/admin/pricing`     | Get all plans |
| POST   | `/api/admin/pricing`     | Create plan   |
| PUT    | `/api/admin/pricing/:id` | Update plan   |
| DELETE | `/api/admin/pricing/:id` | Delete plan   |

### General Info

| Method | Endpoint                                   | Description          |
| ------ | ------------------------------------------ | -------------------- |
| GET    | `/api/admin/general-info`                | Get all general info |
| PUT    | `/api/admin/general-info/about-summary`  | Update about text    |
| PUT    | `/api/admin/general-info/business-hours` | Update hours         |

### Contact

| Method | Endpoint                          | Description           |
| ------ | --------------------------------- | --------------------- |
| GET    | `/api/admin/contact`            | Get contact info      |
| PUT    | `/api/admin/contact`            | Update contact fields |
| POST   | `/api/admin/contact/social`     | Add social link       |
| PUT    | `/api/admin/contact/social/:id` | Update social link    |
| DELETE | `/api/admin/contact/social/:id` | Delete social link    |

### Settings

| Method | Endpoint                         | Description     |
| ------ | -------------------------------- | --------------- |
| PUT    | `/api/admin/settings/username` | Update username |
| PUT    | `/api/admin/settings/password` | Update password |

## Validation System

- **Joi** for schema validation
- Dynamic validator middleware
- Separate schemas per content type
- Predefined lists for controlled inputs (days, social platforms)

## Available Scripts

| Command                  | Description                     |
| ------------------------ | ------------------------------- |
| `npm run dev`          | Start with nodemon (hot reload) |
| `npm start`            | Start in development mode       |
| `npm run prod:start`   | Start in production mode        |
| `npm test`             | Run Jest tests                  |
| `npm run lint`         | Run ESLint                      |
| `npm run migrate`      | Run database migrations         |
| `npm run undo-migrate` | Undo all migrations             |
| `npm run seed`         | Seed database with sample data  |
| `npm run reset`        | Reset environment               |

## Environment Variables

Create `.env.development` from `.env.example`:

```env
# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=bcrypt-hash-here
```

## Dependencies

| Package       | Purpose                |
| ------------- | ---------------------- |
| express       | Web framework          |
| jsonwebtoken  | JWT authentication     |
| bcrypt        | Password hashing       |
| joi           | Request validation     |
| multer        | File uploads           |
| cookie-parser | Cookie handling        |
| cors          | Cross-origin requests  |
| helmet        | Security headers       |
| morgan        | Request logging        |
| ejs           | Template engine        |
| sqlite3       | Database               |
| nodemon       | Development hot reload |
| jest          | Testing framework      |

## Testing

```bash
# Run all tests
npm test
```
