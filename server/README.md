# Gym Website CMS - Server Documentation

## Overview

This is a Node.js Express backend for a gym website CMS with two components:

1. Public-facing site with EJS templates
2. Admin interface in React for content management

## Core Architecture

### 1. Server Structure

```
server/
├── app.js               # Express application setup
├── server.js            # Server entry point
├── data/                # JSON data storage
├── routes/              # API routes
│   ├── api/             # Admin API routes
│   └── views/           # Public site routes
├── controllers/         # Request handlers
├── services/            # Business logic
├── middleware/          # Custom middleware
│   └── validators/      # Joi validation schemas
├── errors/              # Error handling
└── utils/               # Utility functions
```

### 2. Authentication System

- JWT-based with access and refresh tokens
- Tokens stored in HTTP-only cookies
- Single admin user system (no registration)
- Credentials stored in environment variables

### 3. Data Management

- JSON file-based storage in data/ directory
- Each content type has its own JSON file
- Content service handles file I/O operations
- Admin actions logged for audit trail

### 4. API Structure

- `/api/auth` - Authentication endpoints
- `/api/admin` - Combined admin routes:
  - `/dashboard` - Dashboard statistics
  - `/general-info` - Site settings (contact, hours)
  - `/classes` - Classes/programs management
  - `/schedule` - Class schedule management
  - `/pricing` - Pricing plans
  - `/trainers` - Trainer profiles
  - `/gallery` - Image gallery
  - `/events` - Events/News
  - `/testimonials` - Client testimonials
  - `/transformation` - Transformation stories

### 5. Validation System

- Uses Joi for schema validation
- Dynamic validator middleware for consistent validation
- Separate schema files for each content type
- Predefined lists for controlled inputs (days, social platforms)

## API Endpoints

### Authentication

- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout

### General Info

- `GET /api/general-info` - Get all general info
- `PUT /api/general-info/about-summary` - Update about text
- `PUT /api/general-info/business-hours` - Update business hours

### Schedule

- `GET /api/schedule` - Get full class schedule
- `POST /api/schedule` - Add new session
- `PUT /api/schedule/:id` - Update session
- `DELETE /api/schedule/:id` - Delete session

### Pricing

- `GET /api/pricing` - Get all pricing plans
- `POST /api/pricing` - Add new pricing plan
- `PUT /api/pricing/:id` - Update pricing plan
- `DELETE /api/pricing/:id` - Delete pricing plan

### Trainers

- `GET /api/trainers` - Get all trainers
- `POST /api/trainers` - Add new trainer
- `PUT /api/trainers/:id` - Update trainer
- `DELETE /api/trainers/:id` - Delete trainer

## Documentation Index

- [Implementation Status](./Implementation-status.md) - Current progress and pending features
- [Development Guide](./Development-guide.md) - Running, debugging, and testing the application
