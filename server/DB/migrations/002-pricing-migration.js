import create_migration from "../helper/migration_template.js";

export default create_migration({
    upQueries: [
        ` CREATE TABLE IF NOT EXISTS pricing_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            period TEXT NOT NULL,
            description TEXT
        );`,
        `CREATE TABLE IF NOT EXISTS pricing_features (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plan_id INTEGER,
            feature TEXT NOT NULL,
            FOREIGN KEY  (plan_id) REFERENCES pricing_plans(id) ON DELETE CASCADE
        );`
    ],
    downQueries: [
        'DROP TABLE IF EXISTS pricing_features;',
        'DROP TABLE IF EXISTS pricing_plans;'
    ]
});

