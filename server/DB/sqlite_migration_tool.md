**CLI Migration System for SQLite**

* A simple Node.js migration tool for SQLite, inspired by Sequelize migrations but without ORM.
* **Features:**
  * `run` → Run the next pending migration.
  * `run all` → Run all pending migrations.
  * `undo` → Undo the last applied migration.
  * `undo all` → Undo all applied migrations in reverse order.
  * `status` → Show which migrations are applied and pending.
* **Tracking:** Uses `migration-status.json` to track applied migrations.
* **Architecture:**
  <pre class="overflow-visible!" data-start="5227" data-end="5479"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"><span class="" data-state="closed"></span></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>DB/
    db_connection.js         → </span><span>start database connection</span><span>
    db.sqlite           → SQLite DB file
    migrations/      → Migration scripts (</span><span>with</span><span> up & down </span><span>functions</span><span>)
    migration-status.json → Tracks migration state
    migrate.js       → CLI runner
  </span></span></code></div></div></pre>
* **Run with no parameters** → Shows available options.
