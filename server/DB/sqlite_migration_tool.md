**CLI Migration System for SQLite**

* A simple Node.js migration tool for SQLite, inspired by Sequelize migrations .
* **Features:**
  * `run` → Run the next pending migration.
  * `run all` → Run all pending migrations.
  * `undo` → Undo the last applied migration.
  * `undo all` → Undo all applied migrations in reverse order.
  * `status` → Show which migrations are applied and pending.
* **Tracking:** Uses `migration-status.json` to track applied migrations.
* **Architecture:**
  ```
  DB/
    db_connection.js         → Start database connection
    db_constants.js          → Centralized table & column constants
    db.sqlite                → SQLite database file
    migrate.js               → CLI runner
    migration-status.json    → Tracks applied migrations
    migration-status.test.json → Test migration state
    sqlite_migration_tool.md → Documentation
    helper/
      migration_template.js  → Migration template factory
      seed.js                → Database seeding script
    migrations/              → Migration scripts (with up & down functions)
      000-user-migration.js
      ...
  ```
* **Run with no parameters** → Shows available options.
