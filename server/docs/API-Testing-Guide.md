# API Quick Test Checklist

Base URL: `http://localhost:3000`

Keep this file minimal — use automated integration tests for full coverage. Use this checklist for quick manual verification.

Auth

- POST `/api/auth/login` (JSON)
  - Body: { "username": "admin", "password": "`<password>`" }
  - Response: HTTP-only auth cookies (use them for subsequent requests)
- POST `/api/auth/logout` (cookies required)

General

- GET `/api/admin/general-info` (auth required)
- PUT `/api/admin/general-info/about-summary` (JSON: { "about_summary": "text" })

Classes (files)

- POST `/api/admin/classes` (multipart/form-data)

  - Fields: name (string), description (string), private_coaching (boolean), image (file)
- PUT `/api/admin/classes/:id` (multipart/form-data — optional file)
- DELETE `/api/admin/classes/:id`

Pricing

- GET `/api/admin/pricing`
- POST `/api/admin/pricing` (JSON)
  - Required fields: name, price (number), period (daily|weekly|monthly|annually)
- POST `/api/admin/pricing/:id/features` (JSON: { "feature": "text" })

Schedule

- GET `/api/admin/schedule`
- POST `/api/admin/schedule` (JSON)
  - Body: { "class_id": `<number>`, "day_of_week": "monday", "start_time": "18:00", "end_time": "19:00" }
  - Times must be HH:MM (24-hour)

Quick notes

- Use saved cookies after login (Postman: enable "Send cookies").
- Use `application/json` for JSON endpoints and `multipart/form-data` for uploads.
- Prefer running the integration tests in `__tests__/integration/` for reliable checks; keep this checklist for ad-hoc verification only.
