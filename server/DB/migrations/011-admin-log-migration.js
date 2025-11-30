import create_migration from "../helper/migration_template.js";
import {DASHBOARD} from '../db_constants.js';

export default create_migration({
    upQueries: [
        `CREATE TABLE IF NOT EXISTS ${DASHBOARD.TABLE_NAME} (
            ${DASHBOARD.ID} INTEGER PRIMARY KEY AUTOINCREMENT,
            ${DASHBOARD.TIMESTAMP} INTEGER NOT NULL DEFAULT (strftime('%s', 'now')), 
            ${DASHBOARD.ACTION} TEXT NOT NULL,
            ${DASHBOARD.ICON} TEXT NOT NULL
        );`
    ],
    downQueries: [
        `DROP TABLE IF EXISTS ${DASHBOARD.TABLE_NAME};`
    ]
});

