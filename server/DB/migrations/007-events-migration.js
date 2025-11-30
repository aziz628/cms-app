import create_migration from "../helper/migration_template.js";
import {EVENTS} from '../db_constants.js';

export default create_migration({
    upQueries: [
        `CREATE TABLE IF NOT EXISTS ${EVENTS.TABLE_NAME} (
            ${EVENTS.ID} INTEGER PRIMARY KEY AUTOINCREMENT,
            ${EVENTS.TITLE} TEXT NOT NULL,
            ${EVENTS.DESCRIPTION} TEXT,
            ${EVENTS.DATE} INTEGER NOT NULL,
            ${EVENTS.LOCATION} TEXT,
            ${EVENTS.IMAGE} TEXT NOT NULL UNIQUE
        );`
    ],
    downQueries: [
        `DROP TABLE IF EXISTS ${EVENTS.TABLE_NAME};`
    ]
});
 