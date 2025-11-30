 import create_migration from "../helper/migration_template.js";
import {REVIEWS} from '../db_constants.js';

 export default create_migration({
     upQueries: [
         `CREATE TABLE IF NOT EXISTS ${REVIEWS.TABLE_NAME} (
             ${REVIEWS.ID} INTEGER PRIMARY KEY AUTOINCREMENT,
             ${REVIEWS.AUTHOR} TEXT NOT NULL ,
             ${REVIEWS.CONTENT} TEXT NOT NULL ,
             ${REVIEWS.IMAGE} TEXT NOT NULL UNIQUE,
             ${REVIEWS.IDENTITY} TEXT, 
             ${REVIEWS.CREATED_AT} INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
         );`
     ],
    downQueries: [
         `DROP TABLE IF EXISTS ${REVIEWS.TABLE_NAME};`
     ]
 });
