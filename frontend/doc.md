# Gym CMS - Frontend Architecture Documentation

## Overview

This content management system (CMS) is designed to manage content for a gym website. It provides an admin interface to manage classes, trainers, gallery, events, and other gym-related content. Built with React, it communicates with a Node.js/Express backend API using token-based authentication.

## Architecture Overview

The application follows a modern React architecture with the following key patterns:

1. **Component-Based Structure**: UI is divided into reusable components
2. **Context API**: For global state management (auth, notifications)
3. **Custom Hooks**: For shared logic and API communication
4. **Protected Routes**: To secure admin content from unauthorized access
5. **Form Abstraction**: Reusable form handling with validation
6. **Service Layer**: For API communication and data manipulation

## Core Application Flow

1. User lands on the login page
2. Authentication occurs through the API service layer
3. Upon successful login, user is redirected to the dashboard
4. Protected routes ensure only authenticated users can access admin pages
5. CRUD operations are available for all content types

## Key Components

### App Structure (App.jsx)
- Serves as the application's entry point
- Sets up routing with React Router
- Wraps the application with context providers (Auth, Notification)
- Defines protected routes and public routes
- Handles the admin layout structure

### Context Providers
- **AuthContext**: Manages authentication state, login/logout functions
- **NotificationContext**: Handles application-wide notifications/toasts

### Layout Components
- **AdminLayout**: Main layout for authenticated users
- **Header**: Contains navigation and logout functionality
- **Sidebar**: Navigation menu for admin features

### Core Pages
- **Dashboard**: Overview and admin logs
- **Content Pages**: Classes, Trainers, Events, Gallery, etc.
- Each page contains table views and form handling

### Reusable Components
- **FormBuilder**: Dynamic form generation based on field configurations
- **DeleteModal**: Confirmation dialog for delete operations
- **Table**: Reusable data table with sorting and filtering

## Data Flow

1. **API Service Layer**:
   - Uses Axios for HTTP requests
   - Handles authentication token management
   - Implements interceptors for error handling and token refresh
   - Transforms data between client and server formats

2. **Form Handling**:
   - Forms are generated dynamically using the FormBuilder component
   - Validation is performed using Yup schemas
   - File uploads are handled by converting to FormData
   - Submission is processed through the service layer

3. **State Management**:
   - Component-level state for UI interactions
   - Context API for global state (auth, notifications)
   - Service layer for data operations

## Authentication

- Token-based authentication using JWT
- Tokens stored in HTTP-only cookies
- Protected routes redirect unauthorized users to login
- Automatic logout on token expiration
- API interceptors handle 401 responses

## Features

- **Content Management**: CRUD operations for all site content
- **File Uploads**: Image management for classes, trainers, gallery, etc.
- **Validation**: Client-side validation before submitting data
- **Responsive UI**: Works on both desktop and mobile devices
- **Notification System**: Success/error messages for user actions

## Technology Stack

- **Framework**: React (with Hooks and Context API)
- **Routing**: React Router
- **HTTP Client**: Axios
- **Form Validation**: Yup
- **Styling**: Tailwind CSS with custom variables
- **Build Tool**: Vite

## Future Improvements

- Implement state management library for complex data flows
- Add caching for improved performance
- Create more specialized form fields for complex data types
- Enhance error handling with more specific user guidance
- Add comprehensive unit and integration tests
