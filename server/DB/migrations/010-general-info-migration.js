import create_migration from "../helper/migration_template.js";

export default create_migration({
    upQueries: [
        `CREATE TABLE IF NOT EXISTS general_info (
            about_summary TEXT  NOT NULL DEFAULT ''
        );`,
         
        `CREATE TABLE IF NOT EXISTS business_hour (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            day TEXT NOT NULL,
            open_time TEXT NOT NULL,
            close_time TEXT NOT NULL
        );`
    ],
    downQueries: [
        `DROP TABLE IF EXISTS business_hour;`,
        `DROP TABLE IF EXISTS general_info;`
    ]
});
