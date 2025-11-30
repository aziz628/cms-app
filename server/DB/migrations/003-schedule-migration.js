import create_migration from "../helper/migration_template.js";
import {SCHEDULE,CLASSES} from '../db_constants.js';

export default create_migration({
    upQueries: [
        `CREATE TABLE IF NOT EXISTS ${SCHEDULE.TABLE_NAME} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            day_of_week TEXT NOT NULL,
            class_id INTEGER NOT NULL,
            FOREIGN KEY (class_id) REFERENCES ${CLASSES.TABLE_NAME}(id) ON DELETE CASCADE
        );`
    ],
    downQueries: [
        `DROP TABLE IF EXISTS ${SCHEDULE.TABLE_NAME};`
    ]
});
