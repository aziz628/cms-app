 import create_migration from "../helper/migration_template.js";
import {TRAINERS} from '../db_constants.js';

 export default create_migration({
     upQueries: [
         `CREATE TABLE IF NOT EXISTS ${TRAINERS.TABLE_NAME} (
             ${TRAINERS.ID} INTEGER PRIMARY KEY AUTOINCREMENT,
             ${TRAINERS.NAME} TEXT NOT NULL,
             ${TRAINERS.SPECIALITY} TEXT,
             ${TRAINERS.CERTIFICATE} TEXT,
             ${TRAINERS.YEARS_OF_EXPERIENCE} INTEGER,
             ${TRAINERS.IMAGE} TEXT UNIQUE
         );`
         
     ],
     downQueries: [
         `DROP TABLE IF EXISTS ${TRAINERS.TABLE_NAME};`
     ]
 });
 