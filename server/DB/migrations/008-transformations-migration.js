import create_migration from "../helper/migration_template.js";
import {TRANSFORMATIONS} from '../db_constants.js';

export default create_migration({
    upQueries: [
        `CREATE TABLE IF NOT EXISTS ${TRANSFORMATIONS.TABLE_NAME} (
            ${TRANSFORMATIONS.ID} INTEGER PRIMARY KEY AUTOINCREMENT,
            ${TRANSFORMATIONS.NAME} TEXT NOT NULL,
            ${TRANSFORMATIONS.DESCRIPTION} TEXT,
            ${TRANSFORMATIONS.BEFORE_IMAGE} TEXT NOT NULL UNIQUE,
            ${TRANSFORMATIONS.AFTER_IMAGE} TEXT NOT NULL UNIQUE
        );`
    ], 
    downQueries: [
        `DROP TABLE IF EXISTS ${TRANSFORMATIONS.TABLE_NAME};`
    ]
});
