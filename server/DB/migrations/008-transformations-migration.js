import create_migration from "../helper/migration_template.js";

export default create_migration({
    upQueries: [
        `CREATE TABLE IF NOT EXISTS transformations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            before_image TEXT NOT NULL,
            after_image TEXT NOT NULL
        );`
    ],
    downQueries: [
        `DROP TABLE IF EXISTS transformations;`
    ]
});
