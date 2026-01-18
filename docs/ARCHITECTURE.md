# CMS System Architecture

## Backend Architecture

### 1. System Context
This backend acts as the central API for the React Admin Panel and the Server-Side Renderer for the Public EJS Site.
It manages data persistence via the File System (Uploads) and SQLite (Data).

### 2. Core Runtime (Node.js & Express)

The server is built with **Node.js**, utilizing its event-driven (callbacks), non-blocking I/O model. 
This architecture efficiency in handling concurrent requests, make it ideal for a CMS that serves both an admin API and public-facing content.

#### The Event Loop
Node.js runs on a single thread (the Event Loop). To prevent blocking this thread:
- All I/O operations (Database, File System) are asynchronous.
- Controllers are wrapped in `async/await` handlers to ensure errors are caught and passed to the global error handler without crashing the process.
- I/O-intensive tasks (file uploads) are handled via efficient streams (Multer) that store  files in memory , this allow fast remove when validation fail , before saving it to disk.

---

### 3. The Security Layer (Global Middleware)

Before any request reaches the application logic, it passes through a security shield.

#### Helmet (Response Headers)
We use `helmet` to set HTTP headers parsed by the browser to protect users from common attacks:
- **X-Frame-Options: SAMEORIGIN**: Prevents Clickjacking by disallowing the site from being embedded in iframes on other domains.
- **X-Content-Type-Options: nosniff**: Prevents MIME-sniffing attacks.
- **Content-Security-Policy (CSP)**: Restricts where scripts, styles, and images can be loaded from (e.g., only 'self' or specific CDNs).

#### Rate Limiting (DDoS Protection)
We implement in-memory rate limiting to prevent abuse:
- **Public Limiter**: Limits requests per IP for public routes.
- **Auth Limiter**: Strict limits on login endpoints to prevent Brute Force attacks.
- **Admin Limiter**: Higher limits for authenticated admin actions.

#### CORS (Cross-Origin Resource Sharing)
Configured to allow requests only from trusted domains (e.g., the React Admin Panel) while blocking unauthorized cross-origin access.

---

### 4. The Routing Layer

Directs requests based on URL and Method.

#### Route Types
1.  **Public API**: 
    - `/api/auth`: Endpoints for login (`/api/auth`) and public content retrieval.
    - `/{page_name}`: Endpoints for public site pages.
2.  **Protected API**: Endpoints for admin CRUD operations (`/api/admin/*`). These require a valid JWT Access Token.
3.  **Static Assets**:
    - `/assets`: CSS/JS for the public site.
    - `/cms/*`: Static files of  the built admin react app.
    - `/uploads`: User-uploaded images (served directly via Express or Nginx in production).

---

### 5. The Logic Layer (Middleware Pipelines)

We use a "Fail Fast" philosophy. Requests are validated in stages before reaching the controller.

#### The 5-Step File Upload Pipeline
For endpoints that handle file uploads (e.g., creating a Class), we use a custom middleware factory:

1.  **Memory Upload (Multer)**:
    - Receives the file stream into RAM.
    - Enforces a hard limit (e.g., 5MB) to prevent memory exhaustion.
2.  **Header Check**:
    - Compares `Content-Length` header with actual buffer size to detect spoofing.
3.  **Joi Validation**:
    - Validates the JSON body (e.g., `name`, `description`).
    - If body is invalid, the request is rejected *before* saving the file to disk.
4.  **File Validator**:
    - Checks file presence (required vs optional).
    - Validates Magic Numbers (Hex Signature) to ensure a `.jpg` is actually an image, not a renamed `.exe`.
5.  **File Saver & Storage Tracking**:
    - Saves the file to disk with a unique name.
    - Increments the global storage counter (Fire-and-Forget).

---

### 6. The Service Layer (Business Logic)

Controllers are thin; Services contain the logic.

#### Hybrid Session Store
A custom solution for Single-Admin authentication:
- **RAM**: Stores the current valid `session_id`. Verification is nanosecond-fast.
- **SQLite**: Persists the `session_id`. On server restart, RAM is restored from DB.
- **Benefit**: Combines the speed of in-memory sessions with the persistence of a database.

#### Storage Service 
To enforce the 1GB total storage limit without scanning the disk on every upload:
- storage is checked with in-memory storage counter
- We maintain a `storage-state.json` file for persistence and avoid disk scanning on restart
- **Write**: When a file is uploaded, we update the JSON asynchronously (Fire-and-Forget) to avoid blocking the response.
- **Recovery**: On server boot, if the state is corrupt, we run reset to rebuild the json.

#### Schedule Service
- **Pre-computation**: The schedule (Days x Hours) is complex so instead of regular table element we used a custom  algorithm that build each day column seperately , and we made this service to precompute the sessions coordinates of each column then pass them to template for easy rendering. 
- **Read Optimization**: we optimized the fetching of the schedule data by formating the data as json object/arrays  then order them by day , this provide both template and reactjs a clear data for computation and rendering .

---

### 7. The Data Layer

#### SQLite Database
- **Choice**: Lightweight, serverless, file-based. Perfect for a single-admin CMS.
- **WAL Mode**: Write-Ahead Logging enabled for better concurrency.

#### Migration Tool
A custom-built migration runner (`DB/migrate.js`) that:
- Tracks applied migrations in a `migration-status.json` .
- Allows `up` (apply) and `down` (revert) operations for schema evolution.


### 8. Code Patterns & Standards

#### Data Access (Raw SQL over ORM)
- **Decision:** We use `sqlite3` driver with raw SQL queries instead of an ORM (like Sequelize/TypeORM).
- **Reasoning:**
    - **Performance:** No overhead from object mapping.
    - **Control:** Complex queries (like Schedule collisions) are hand-tuned for SQLite.
    - **Simplicity:** No extra abstraction layers hiding the database logic.

#### Constants for Schema Integrity
- **Pattern:** All table names and column names are stored in `DB/constants.js`.
- **Reasoning:** Prevents typos (e.g., `users` vs `user`) and allows safe refactoring.

#### API Response Format
- **Standard:** All API responses follow a flexible  JSON envelope the body of the response is the raw data and status is the status code in the header

#### Global Error Handling
- **Pattern:** All async errors are caught by `utils/async_handler.js` and passed to `middleware/error_handler.js`.
- **Reasoning:** Prevents "Unhandled Promise Rejections" from crashing the server. Ensures the client always gets friendly JSON error response, never a hanging request or system error.

## Frontend Architecture

### 1. Public Site (EJS - Server Side Rendering)
- **Architecture:** Multi-Page Application (MPA).
- **Pagination Strategy:**
    - Server calculates `offset` based on query params (`?page=2`).
    - Controller passes `pagination` object (`{ current, total, hasNext }`) to the view.
    - EJS template renders "Next/Prev" buttons based on this object.
- **Styling (Tailwind Standalone):**
    - **Decision:** We use the standalone Tailwind CLI binary.
    - **Reasoning:** Decouples the CSS build from the Node.js runtime environment. Allows generating CSS for EJS templates without a complex build step (like Webpack).

### 2. Admin Panel (React SPA)
- **Philosophy:** All components (Modals, Tables, Toasts) are custom-built without external libraries.
    - **Reasoning:** Maximum control, minimal bundle size, and deep understanding of React lifecycle.

#### Core Systems
- **Routing:** `react-router-dom` v6 with a custom `ProtectedRoute` wrapper that checks Auth Context before rendering.
- **State Management:**
    - **AuthContext:** Implements a 3-state machine (`loading`, `authenticated`, `unauthenticated`) to handle the initial session check.
    - **ThemeContext:** Toggles CSS variables on the `:root` element and persists preference to `localStorage`.
    - **NotificationContext:** A custom queue system for displaying Toast messages.

#### The Form Engine (FormBuilder)
- **Concept:** Dynamic form built from a configuration array.
- **Mechanism:** Instead of writing JSX for every form, we pass a configuration array (`[{ name: 'title', type: 'text' }]`) to the `FormBuilder` component.
- **Validation:** Uses `yup` schemas. This mirrors the backend's `Joi` validation, ensuring consistency.
- **edge cases:** in simpler cases to hande one or two inputs  we use custum forms containing a state and the  validate/submit .  

#### Complex Logic: The Schedule
- **Problem:** Rendering a weekly schedule with overlapping classes.
- **Solution:** A custom collision-detection algorithm runs on the client. It calculates the `top` (time) and `height` (duration) of each event, and determines if events overlap to adjust their `width` and `left` position (CSS Grid/Flex logic).

---

## Fullstack Integration

### 1. Authentication Handshake
- **Mechanism:** JWT (JSON Web Tokens) stored in **HTTP-Only Cookies**.
- **Flow:**
    1.  React sends `POST /api/auth/login`.
    2.  Server verifies credentials and sets `access_token` and `refresh_token` cookies.
    3.  React see the success status code and set the `authenticated` state in the AuthContext.
    4.  Subsequent API requests automatically include the cookies.
- **Security:** Prevents XSS attacks from stealing tokens (since JS cannot read the cookies).

### 2. Environment Management
- **Development:**
    - React runs on Port 5173 (Vite Dev Server).
    - Express runs on Port 3000.
    - Vite proxies `/api` requests to `localhost:3000`
    - in case of using docker the server domain is the service name `server`.
- **Production:**
    - React is built into static files (`dist/`).
    - Express serves these static files at `/cms/*`.
    - No proxy needed; same origin.

---

## Cross-layer Concerns

### Logging Strategy
- **Library:** `winston` + `morgan`.
- **Layers:**
    - **HTTP Logs:** `morgan` logs every request (Method, URL, Status, Time) to console.
    - **System Logs:**
        - `error.log`: Captures only error-level events (System crashes, Unhandled exceptions).
        - `app.log`: Captures errors and warnings (Combined stream).
    - **Audit Logs:** Specific admin actions (Create Class, Delete User) are logged to a separate file (`audit.log`) and displayed on the Admin Dashboard.

### Testing Strategy

#### 1. Philosophy: Integration over Unit
- **Decision:** We prioritize **Integration Tests** (Supertest + SQLite) over Unit Tests.
- **Reasoning:**
    - Testing the full HTTP request lifecycle (Middleware -> Controller -> Service -> DB) catches more bugs than testing isolated functions.
    - Since our DB is SQLite (fast file I/O), integration tests run almost as fast as unit tests.

#### 2. Unit Testing (Targeted)
- **Scope:** Reserved for complex, isolated logic with high cyclomatic complexity.
- **Examples:**
    - `Storage Service`: Testing the state file recovery logic.
    - `Schedule Algorithm`: Testing collision detection (upcoming).

#### 3. Test Infrastructure
- **Isolation:**
    - Tests run sequentially (`--runInBand`) to prevent DB locking issues.
- **Helpers:**
    - `tools.js`: Provides utilities like `get_authed_cookie()` to bypass the login flow in every test.
    - `fixtures/`: Contains static data (fake images, user objects) to ensure reproducible tests.
- **Setup:**
    - **Global Setup:** Runs once before all tests. It resets the database and runs all migrations to ensure a clean schema.
    - **Global Teardown:** Runs once after all tests. It resets the database and delete all uploaded files and undo all migrations .
    - **Per-Test Cleanup:** Individual tests are responsible for cleaning up their specific data (or we rely on the global reset for the next run).