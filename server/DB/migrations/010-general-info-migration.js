import create_migration from "../helper/migration_template.js";

export default create_migration({
    // update-only fields will use just one row
    upQueries: [
        `CREATE TABLE IF NOT EXISTS general_info (
            about_summary TEXT  NOT NULL DEFAULT '',
            about_image TEXT NOT NULL DEFAULT 'about_image.webp',
            hero_title TEXT NOT NULL DEFAULT 'Transform Your Body & Mind',
            hero_subtitle TEXT NOT NULL DEFAULT 'Join our community of fitness enthusiasts and achieve your goals with expert guidance and state-of-the-art facilities.',
            hero_image TEXT NOT NULL DEFAULT 'hero_image.jpg'
        );`,

        // create the row needed using default values
        `INSERT INTO general_info DEFAULT VALUES;`,

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
