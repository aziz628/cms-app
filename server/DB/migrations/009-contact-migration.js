import create_migration from "../helper/migration_template.js";


export default create_migration({
    // there in one contact entry only
    // social media links are multiple entries
    upQueries: [
        `CREATE TABLE IF NOT EXISTS contact (
            address TEXT NOT NULL DEFAULT '',
            phone_number TEXT NOT NULL DEFAULT '',
            email TEXT NOT NULL DEFAULT ''
        );`,
        `CREATE TABLE IF NOT EXISTS social_media_link (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            platform TEXT NOT NULL,
            link TEXT NOT NULL
        );`
    ],
    downQueries: [
        `DROP TABLE IF EXISTS social_media_link;`,
        `DROP TABLE IF EXISTS contact;`
    ]
});
