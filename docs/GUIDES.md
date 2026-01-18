# Developer Guides

This document serves as a guide for extending the application. It outlines the standard patterns for adding new features, ensuring consistency across the codebase.

---

## How to Add a New Content Type

Follow this checklist to implement a new feature (e.g., "Workshops") from Database to UI.

### Part 1: Backend Implementation

#### 1. Database Layer
1.  **Define Constants:** Add table and column names to `server/DB/constants.js`.
    *   *Why:* Prevents typos and allows safe refactoring.
2.  **Create Migration:** Create a new file in `server/DB/migrations/` (e.g., `009-workshops.js`).
    *   Use `db.run()` to create the table with Foreign Keys and Constraints.
    *   Implement both `up()` (create) and `down()` (drop) methods.

#### 2. Service Layer (`server/services/`)
Create `workshops_service.js`. This is where the business logic lives.
*   **Pattern:**
    *   Use `sqlite3` (or your raw SQL wrapper) for queries.
    *   **Error Handling:** If a record isn't found or validation fails, throw an `AppError`.
        ```javascript
        if (!workshop) throw new AppError("Workshop not found", 404);
        ```
    *   **Audit:** Call `admin_record_service.record_action()` for write operations (Create/Update/Delete).

#### 3. Controller Layer (`server/controllers/`)
Create `workshops_controller.js`. Keep it thin.
*   **Pattern:**
    *   Extract data from `req.body` / `req.params`.
    *   Call the Service.
    *   Send the response using the standard JSON format.
    *   **Important:** Do *not* use try/catch blocks here. The router wrapper handles it.

#### 4. Route Layer (`server/routes/api/`)
Create `workshops_route.js`.
*   **Pattern:**
    *   Import `asyncHandler` from `utils/async_controller.js`.
    *   Wrap every controller method: `router.get('/', asyncHandler(controller.getAll))`.
    *   **File Uploads:** If the feature needs images, use the middleware factory:
        ```javascript
        const uploadPipeline = create_upload_pipeline({
            validator: workshopValidator, // Joi schema
            section: "workshops" // Folder name in /uploads
        });
        router.post('/', uploadPipeline, asyncHandler(controller.create));
        ```
    * link the route to higher level router to app.js .

#### 5. Integration Testing (`server/__tests__/integration/`)
Create `workshops.test.js`.
*   **Pattern:**
    *   Use `tools.get_authed_cookie()` to bypass login.
    *   Use `supertest` to hit the API endpoints.
    *   Test Happy Path (2xx OK) and Sad Path (4xx error).

---

### Part 2: Frontend Implementation

#### 1. Service Layer (`frontend/src/services/`)
Create `workshopService.js`.
*   **Pattern:**
    *   Import the global `api` axios instance.
    *   Define methods matching the backend endpoints (`getAll`, `create`, `delete`).
    *   **File Uploads:** If sending files, use `FormData` instead of JSON.

#### 2. Validation Schema (`frontend/src/validation/schemas/`)
Create `workshopSchema.js`.
*   **Pattern:**
    *   Use `yup` to define the shape.
    *   Ensure it mirrors the backend Joi schema (e.g., max lengths, required fields).

#### 3. UI Component (`frontend/src/pages/`)
Create `Workshops.jsx`.
*   **Complex Forms:** Use `FormBuilder`.
    *   Define a `fields` array config (`{ name: 'title', type: 'text' }`).
    *   Pass the config and the `yup` schema to `<FormBuilder />`.
*   **Simple Forms:** Build a custom form with local state.
*   **State:**
    *   Use `NotificationContext` to show success/error toasts.
    *   Use `AuthContext` if you need user details.

---

##  Common Patterns

### The Middleware Factory (`create_upload_pipeline`)
Used for any route that accepts files. It automatically handles:
1.  **Memory Upload:** Buffers file to RAM (limit 5MB).
2.  **Header Check:** Anti-spoofing validation.
3.  **Joi Validation:** Validates `req.body` *before* saving the file.
4.  **File Save:** Writes to disk and updates the Storage Service.

### Async Controller Wrapper
*   **Usage:** `asyncHandler(controller.method)`
*   **Purpose:** Catches any error thrown in the controller/service (like `AppError`) and passes it to the global error handler middleware, ensuring the client gets a proper JSON error response.
