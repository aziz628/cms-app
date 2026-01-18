# Operations Manual

This document covers how to Run, Debug, and Test the application in different environments.

---

## Running the Application

### 1. Development Environment (Docker) - *Recommended*
The easiest way to start developing. Handles DB, Node, and React in isolated containers.

1.  **Setup Env:** Ensure `.env.development` exists in `server/` and `.env` in `frontend/`.
2.  **Run:**
    ```bash
    docker compose up --build
    ```
3.  **Access:**
    *   Admin Panel: `http://localhost:5173`
    *   API: `http://localhost:3000`
    *   **Persistence:** Docker Volumes map `server/uploads` and `server/DB` to your host, so data survives restarts.

### 2. Development Environment (Host Manual)
If you prefer running Node/React directly on your machine.

1.  **Prerequisites:** Node.js 20+, Tailwind CLI installed globally.
2.  **Setup:**
    ```bash
    node script/dev_setup.js  # Installs deps & runs migrations
    ```
3.  **Run:**
    *   **Windows:** `script/run_dev.bat`
    *   **Linux/Mac:** `script/run_dev.sh`

### 3. Production Environment
Optimized for performance and security.

1.  **Run:**
    ```bash
    docker compose -f docker-compose.prod.yml up --build -d
    ```
    *   *Note:* No manual setup needed. The multi-stage Dockerfile handles the build and migration automatically.
2.  **Access:**
    *   Application: `http://localhost:3000` (React is served statically by Express at `/cms`).

---

## Configuration

### Environment Variables
*   **`server/.env.development`**: Local dev settings (Debug logging, Dev DB).
*   **`server/.env.production`**: Prod settings (Secure Cookies, Prod DB).
*   **`server/.env.test`**: Test settings (Test DB, fast hashing).
*   **`frontend/.env`**: Vite configuration.
    *   `API_HOST`: must be set correctly per env , either `server` or `127.0.0.1`

---

## Debugging

### VS Code Debugger
We have pre-configured launch tasks in `.vscode/launch.json`.

1.  **Debug Server:**
    *   Select "Debug server" from the dropdown menu and run it
    *   This attaches the debugger to the `server.js` process. You can set breakpoints in Controllers/Services.
    *   *Variables:* Use the "Variables" pane to inspect `req.body` or `res.locals`.

2.  **Debug Tests:**
    *   Select "Debug Jest Tests" from the dropdown menu and run it
    *   Runs tests with the debugger attached. Perfect for investigating why a specific test is failing.

### Browser Debugging
*   **React DevTools:** Inspect Component State (AuthContext, FormBuilder props).
*   **Network Tab:** Verify API payloads and JWT Cookies (HttpOnly cookies won't show in Application tab, but appear in Network requests).

---

## Testing & QA

### Manual Testing (Postman)
1.  **Import Collection:** Import the provided Postman JSON collection.
2.  **Environment:** Set `baseUrl` to `http://localhost:3000/api`.
3.  **Auth:** Login via the `/auth/login` endpoint first to set the cookie in Postman's cookie jar.
4.  **test:** run the tests after editing the payloads

### Automated Testing (Jest)
*   **Run All Tests:**
    ```bash
    npm test
    ```
*   **Run Specific Test File:**
    ```bash
    npm test -- transformation.test.js
    ```

### Git Workflow
1.  **Branching:** Create a feature branch (e.g. `feat/workshop`)
2.  **Commit:** Use conventional commits (e.g. `feat: add workshop service`).
3.  **Merge:** Pull Request -> Review -> Merge to Main.
