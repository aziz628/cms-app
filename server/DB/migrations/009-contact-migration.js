import create_migration from "../helper/migration_template.js";
import {CONTACT,SOCIAL_MEDIA_LINKS} from '../db_constants.js';


export default create_migration({
    // there in one contact entry only
    // social media links are multiple entries
    upQueries: [
        `CREATE TABLE IF NOT EXISTS ${CONTACT.TABLE_NAME} (
            ${CONTACT.ADDRESS} TEXT NOT NULL DEFAULT '',
            ${CONTACT.PHONE_NUMBER} TEXT NOT NULL DEFAULT '',
            ${CONTACT.EMAIL} TEXT NOT NULL DEFAULT ''
        );`,
        `INSERT INTO ${CONTACT.TABLE_NAME} (address, phone_number, email) VALUES ('', '', '');`,

        `CREATE TABLE IF NOT EXISTS ${SOCIAL_MEDIA_LINKS.TABLE_NAME} (
            ${SOCIAL_MEDIA_LINKS.ID} INTEGER PRIMARY KEY AUTOINCREMENT,
            ${SOCIAL_MEDIA_LINKS.PLATFORM} TEXT NOT NULL,
            ${SOCIAL_MEDIA_LINKS.LINK} TEXT NOT NULL
        );`
    ],
    downQueries: [
        `DROP TABLE IF EXISTS ${SOCIAL_MEDIA_LINKS.TABLE_NAME};`,
        `DROP TABLE IF EXISTS ${CONTACT.TABLE_NAME};`
    ]
});
