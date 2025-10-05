import create_migration from "../helper/migration_template.js";

export default create_migration({
    upQueries: [
        `CREATE TABLE IF NOT EXISTS admin_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now')), 
            action TEXT NOT NULL,
            icon TEXT NOT NULL
        );`
    ],
    downQueries: [
        `DROP TABLE IF EXISTS admin_log;`
    ]
});
