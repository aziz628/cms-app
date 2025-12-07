# Gym Website CMS

A full-stack content management system for managing gym website content. Features a React admin panel connected to an Express.js backend with JWT authentication.

## Project Structure

```
cms-app/
├── frontend/          # React admin panel (Vite + Tailwind CSS)
├── server/            # Express.js backend with EJS templates
├── script/            # Cross-platform development scripts
├── package.json       # Root package.json
└── setup.js           # Initial environment setup
```

## Features

### Admin Panel (React)

- JWT cookie-based authentication
- Dashboard with admin activity logs
- CRUD operations for 10+ content types
- File uploads with image preview
- Light/Dark theme toggle
- Responsive design
- Form validation with Yup

### Backend (Express.js)

- RESTful API for admin operations
- EJS templates for public-facing site
- SQLite database with JSON file storage
- Secure authentication with refresh tokens
- Request validation with Joi
- Jest testing suite

## Quick Start

##### Option A: Docker (Recommended)

*Prerequisites: Docker Desktop or Docker Engine.*

1. **Clone & Setup Env**

   ```bash
   git clone <repo>
   cd cms-app
   node setup.js
   ```
2. **Run**

   ```bash
   docker compose up --build
   ```

---

##### Option B: Manual Host Setup

*Prerequisites: Node.js 22 , Tailwind CLI 3.4.1 installed globally.*

1. **Run the Host Setup Script**
   This installs dependencies and runs migrations.

   ```bash
   node script/dev_setup.js
   ```
2. **Start Development Servers**

   * **Windows:** Run [script/run_dev.bat](cci:7://file:///c:/Users/wesla/Documents/personal%20projects/code%20projects/Web_front_end_pages/template%20system/cms-app/script/run_dev.bat:0:0-0:0)
   * **Linux/Mac:** Run [script/run_dev.sh](cci:7://file:///c:/Users/wesla/Documents/personal%20projects/code%20projects/Web_front_end_pages/template%20system/cms-app/script/run_dev.sh:0:0-0:0)

### Development Workflow

1. **Access the application**

   - Admin Panel: http://localhost:5173
   - Backend API: http://localhost:3000
2. **Running Commands:**
   To run scripts like tests inside the container:

   ```bash
      docker compose exec server npm run test
   ```
3. **Editing Code:**

   Simply edit files in your `server/` or `frontend/` directories. The changes will be reflected instantly in the running containers.

## Documentation

- [Frontend Documentation](./frontend/README.md) - React app architecture and components
- [Backend Documentation](./server/README.md) - API endpoints and server configuration
- [Frontend Architecture](./frontend/doc.md) - Detailed frontend design patterns

## Tech Stack

### Frontend

- React 19 with Hooks
- Vite 7 (build tool)
- React Router 7
- Axios (HTTP client)
- Tailwind CSS (styling)
- Yup (validation)

### Backend

- Express.js 4
- SQLite 3
- JWT (authentication)
- Multer (file uploads)
- Joi (validation)
- EJS (templates)
- Jest (testing)

## Content Types

| Content         | Features                                         |
| --------------- | ------------------------------------------------ |
| Classes         | Name, description, image                         |
| Trainers        | Profile, specializations, image                  |
| Events          | Title, date, description, image                  |
| Reviews         | Client testimonials                              |
| Transformations | Before/after stories with images                 |
| Gallery         | Categories with multiple images                  |
| Schedule        | Weekly class schedule with collision detection   |
| Pricing         | Plans with features list                         |
| General Info    | Business hours, about section summary and image |
| Contact         | Contact fields, social media links               |
