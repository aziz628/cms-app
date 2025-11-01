import create_migration from "../helper/migration_template.js";

export default create_migration({
    upQueries: [
        `CREATE TABLE IF NOT EXISTS event (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            date INTEGER NOT NULL,
            location TEXT,
            image TEXT NOT NULL
        );`
    ],
    downQueries: [
        `DROP TABLE IF EXISTS event;`
    ]
});
