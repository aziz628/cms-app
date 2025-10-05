import create_migration from "../helper/migration_template.js";


export default create_migration({
    // there in one contact entry only
    // social media links are multiple entries
    upQueries: [
        `CREATE TABLE IF NOT EXISTS contact (
            address TEXT,
            phone_number TEXT,
            email TEXT
        );`,
        // Add contact default row
        `INSERT INTO contact (address, phone_number, email) 
         VALUES (NULL, NULL, NULL);`,

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
