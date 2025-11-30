import create_migration from "../helper/migration_template.js";
import {GENERAL_INFO,BUSINESS_HOURS} from '../db_constants.js';

export default create_migration({
    // update-only fields will use just one row
    upQueries: [
        `CREATE TABLE IF NOT EXISTS ${GENERAL_INFO.TABLE_NAME} (
            ${GENERAL_INFO.ABOUT_SUMMARY} TEXT  NOT NULL DEFAULT '',
            ${GENERAL_INFO.ABOUT_IMAGE} TEXT NOT NULL UNIQUE  DEFAULT 'about_image.webp',
            ${GENERAL_INFO.HERO_TITLE} TEXT NOT NULL DEFAULT 'Transform Your Body & Mind',
            ${GENERAL_INFO.HERO_SUBTITLE} TEXT NOT NULL DEFAULT 'Join our community of fitness enthusiasts and achieve your goals with expert guidance and state-of-the-art facilities.',
            ${GENERAL_INFO.HERO_IMAGE} TEXT NOT NULL UNIQUE DEFAULT 'hero_image.jpg'
        );`,

        // create the row needed using default values
        `INSERT INTO ${GENERAL_INFO.TABLE_NAME} DEFAULT VALUES;`,

        `CREATE TABLE IF NOT EXISTS ${BUSINESS_HOURS.TABLE_NAME} (
            ${BUSINESS_HOURS.ID} INTEGER PRIMARY KEY AUTOINCREMENT,
            ${BUSINESS_HOURS.DAY} TEXT NOT NULL,
            ${BUSINESS_HOURS.OPEN_TIME} TEXT NOT NULL,
            ${BUSINESS_HOURS.CLOSE_TIME} TEXT NOT NULL
        );`
    ],
    downQueries: [
        `DROP TABLE IF EXISTS ${BUSINESS_HOURS.TABLE_NAME};`,
        `DROP TABLE IF EXISTS ${GENERAL_INFO.TABLE_NAME};`
    ]
});
