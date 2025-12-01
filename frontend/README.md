# Gym CMS - React Admin Panel

A modern React admin panel for managing gym website content. Built with Vite, Tailwind CSS, and a component-based architecture.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The development server runs at http://localhost:5173

## Project Structure

```
frontend/
├── src/
│   ├── assets/
│   │   └── css/
│   │       └── theme.css       # CSS variables for theming
│   ├── components/
│   │   ├── common/             # Reusable UI components
│   │   │   ├── FormBuilder.jsx # Dynamic form generator
│   │   │   ├── DeleteModal.jsx # Confirmation dialogs
│   │   │   └── LoadingSpinner.jsx
│   │   ├── content/            # Content-specific components
│   │   │   ├── PaginationButtons.jsx
│   │   │   └── Toast.jsx
│   │   ├── forms/              # Specialized form components
│   │   │   ├── ContactForms.jsx
│   │   │   ├── GeneralInfoForms.jsx
│   │   │   └── SettingForms.jsx
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Layout.jsx
│   │   └── schedule/           # Schedule-specific components
│   │       ├── DayColumn.jsx
│   │       ├── HourRow.jsx
│   │       └── scheduleHelpers.js
│   ├── context/                # React Context providers
│   │   ├── AuthContext.jsx     # Authentication state
│   │   ├── NotificationContext.jsx  # Toast notifications
│   │   └── ThemeContext.jsx    # Light/dark theme
│   ├── pages/                  # Page components (13 total)
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Classes.jsx
│   │   ├── Trainers.jsx
│   │   ├── Events.jsx
│   │   ├── Reviews.jsx
│   │   ├── Transformations.jsx
│   │   ├── Gallery.jsx         # Parent-child (categories + images)
│   │   ├── Schedule.jsx        # Collision detection, time slots
│   │   ├── Pricing.jsx         # Nested (plans + features)
│   │   ├── GeneralInfo.jsx     # Business hours + about
│   │   ├── Contact.jsx         # Contact + social media
│   │   ├── Settings.jsx        # Account + theme
│   │   └── NotFound.jsx
│   ├── services/               # API service layer
│   │   ├── api.js              # Axios instance with interceptors
│   │   ├── authService.js
│   │   ├── classService.js
│   │   ├── trainerService.js
│   │   └── ...                 # Other content services
│   ├── utils/
│   │   └── tools.js            # Utility functions and custom hooks
│   ├── validation/
│   │   └── schemas/            # Yup validation schemas
│   │       ├── classSchema.js
│   │       ├── trainerSchema.js
│   │       └── ...
│   ├── App.jsx                 # Main app with routing
│   ├── main.jsx                # React entry point
│   └── index.css               # Tailwind directives
├── doc.md                      # Architecture documentation
├── tailwind.config.mjs         # Tailwind configuration
├── vite.config.js              # Vite configuration
├── compile_tailwind.sh         # Linux Tailwind compiler
├── compile_tailwind.bat        # Windows Tailwind compiler
└── package.json
```

## Architecture

### Component Patterns

#### FormBuilder

Dynamic form generator that handles:

- Multiple field types (text, textarea, select, file, checkbox)
- Create vs Edit modes with different validation
- File upload with image preview
- Change detection for updates

```jsx
<FormBuilder
  fields={formFields}
  initialData={editingItem}
  onSubmit={handleSubmit}
  isEditing={!!editingItem}
  submitLabel="Save"
/>
```

#### Protected Routes

Routing component that redirect to `/login` when not authenticated:

```jsx
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>
```

### Context Providers

| Context                 | Purpose                                              |
| ----------------------- | ---------------------------------------------------- |
| `AuthContext`         | Login/logout, user state, auth checking              |
| `NotificationContext` | Toast notifications (success, error, info)           |
| `ThemeContext`        | Light/dark mode toggle with localStorage persistence |

### Service Layer

All API calls go through the service layer which:

- Uses Axios with configured base URL
- Handles auth token via HTTP-only cookies
- Intercepts 401 responses for auto-logout
- Transforms data for FormData uploads

## Theming

The app uses CSS variables for theming, defined in `assets/css/theme.css`:

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #1f2937;
  /* ... */
}

[data-theme="dark"] {
  --bg-primary: #1f2937;
  --text-primary: #f9fafb;
  /* ... */
}
```

Variables are mapped to Tailwind classes in `tailwind.config.mjs`.

## Validation

Yup schemas with separate modes for create/update:

```javascript
// Create mode: image required
// Update mode: image optional (keep existing if not changed)
export const createClassSchema = yup.object({ /* ... */ });
export const updateClassSchema = yup.object({ /* ... */ });
```

## Dependencies

| Package          | Version | Purpose             |
| ---------------- | ------- | ------------------- |
| react            | 19.1.1  | UI framework        |
| react-router-dom | 7.8.2   | Client-side routing |
| axios            | 1.11.0  | HTTP client         |
| yup              | 1.7.1   | Form validation     |
| vite             | 7.1.2   | Build tool          |

## Available Scripts

| Command                      | Description              |
| ---------------------------- | ------------------------ |
| `npm run dev`              | Start development server |
| `npm run build`            | Build for production     |
| `npm run preview`          | Preview production build |
| `npm run lint`             | Run ESLint               |
| `npm run compile_tailwind` | Compile Tailwind CSS     |

## Additional Documentation

See [doc.md](./doc.md) for detailed architecture documentation including:

- Core application flow
- Data flow patterns
- Authentication system
- Future improvements
