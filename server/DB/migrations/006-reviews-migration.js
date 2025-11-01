 import create_migration from "../helper/migration_template.js";
 
 export default create_migration({
     upQueries: [
         `CREATE TABLE IF NOT EXISTS reviews (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             author TEXT not null,
             content TEXT not null,
             image TEXT not null,
             identity TEXT, 
             created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
         );`
     ],
    downQueries: [
         `DROP TABLE IF EXISTS reviews;`
     ]
 });