import create_migration from "../helper/migration_template.js";

export default create_migration({
    upQueries: [
        `CREATE TABLE IF NOT EXISTS classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            private_coaching BOOLEAN DEFAULT false,
            image TEXT
        );`
    ],
    downQueries: [
        `DROP TABLE IF EXISTS classes;`
    ]
});