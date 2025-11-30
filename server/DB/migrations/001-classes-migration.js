import create_migration from "../helper/migration_template.js";
import {CLASSES} from '../db_constants.js';

export default create_migration({
    upQueries: [
        `CREATE TABLE IF NOT EXISTS ${CLASSES.TABLE_NAME} (
            ${CLASSES.ID} INTEGER PRIMARY KEY AUTOINCREMENT,
            ${CLASSES.NAME} TEXT NOT NULL,
            ${CLASSES.DESCRIPTION} TEXT,
            ${CLASSES.PRIVATE_COACHING} BOOLEAN DEFAULT false,
            ${CLASSES.IMAGE} TEXT  UNIQUE
        );`
    ],
    downQueries: [
        `DROP TABLE IF EXISTS ${CLASSES.TABLE_NAME};`
    ]
});
