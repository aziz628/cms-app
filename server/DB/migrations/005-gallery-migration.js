import create_migration from "../helper/migration_template.js";

export default create_migration({
    upQueries: [
        `CREATE TABLE IF NOT EXISTS gallery_category (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        );`,
        `CREATE TABLE IF NOT EXISTS gallery_image (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            description TEXT,
            filename TEXT NOT NULL UNIQUE,
            category_id INTEGER,
            FOREIGN KEY (category_id) REFERENCES gallery_category(id) ON DELETE SET NULL
        );`
    ],
    downQueries: [
        `DROP TABLE IF EXISTS gallery_image;`,
        `DROP TABLE IF EXISTS gallery_category;`
    ]
});