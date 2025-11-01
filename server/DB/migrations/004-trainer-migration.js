 import create_migration from "../helper/migration_template.js";
 
 export default create_migration({
     upQueries: [
         `CREATE TABLE IF NOT EXISTS trainers (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             name TEXT NOT NULL,
             speciality TEXT,
             certificate TEXT,
             years_of_experience INTEGER,
             image TEXT
         );`
         
     ],
     downQueries: [
         `DROP TABLE IF EXISTS trainers;`
     ]
 });