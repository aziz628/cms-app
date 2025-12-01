# Gym Website CMS

A full-stack content management system for managing gym website content. Features a React admin panel connected to an Express.js backend with JWT authentication.

## Project Structure

```
cms-app/
├── frontend/          # React admin panel (Vite + Tailwind CSS)
├── server/            # Express.js backend with EJS templates
├── script/            # Cross-platform development scripts
├── package.json       # Root package.json
└── setup.js           # Initial project setup
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

### Prerequisites

- Node.js v22.12.0 or higher
- npm

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/aziz628/cms-app
   cd cms-app
   ```
2. **Run the setup script**

   ```bash
   npm run setup
   ```

   This installs dependencies for both frontend and server.
3. **Start development servers**

   **Linux:**

   ```bash
   ./script/run_dev.sh
   ```

   **Windows:**

   ```bash
   script\run_dev.bat
   ```

   Or start each server manually:

   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```
4. **Access the application**

   - Admin Panel: http://localhost:5173
   - Backend API: http://localhost:3000

## Documentation

- [Frontend Documentation](./frontend/README.md) - React app architecture and components
- [Backend Documentation](./server/README.md) - API endpoints and server configuration
- [Frontend Architecture](./frontend/doc.md) - Detailed frontend design patterns

## Development Scripts

| Script                     | Platform | Description                                 |
| -------------------------- | -------- | ------------------------------------------- |
| `script/run_dev.sh`      | Linux    | Starts both servers with process management |
| `script/run_dev.bat`     | Windows  | Starts both servers                         |
| `check-dependencies.sh`  | Linux    | Verifies required dependencies              |
| `check-dependencies.bat` | Windows  | Verifies required dependencies              |

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
| General Info    | Business hours, about section summary and image  |
| Contact         | Contact fields, social media links               |
