import { run_in_transaction } from "../../utils/db_utils.js";

/**
 * Creates a migration object with up and down methods.
 * @param {Object} options - The migration options.
 * @param {string[]} options.upQueries - The SQL queries to run for the migration.
 * @param {string[]} options.downQueries - The SQL queries to run to revert the migration.
 * @returns {Object} The migration object with up and down methods.
 * */
export default function create_migration(options) {
  const { upQueries, downQueries } = options;
  
  return {
    up: async (db) => {
      await run_in_transaction(db, async () => {
        for (const query of upQueries) {
          await db.run(query);
        }
      });
    },

    down: async (db) => {
      await run_in_transaction(db, async () => {
        for (const query of downQueries) {
          await db.run(query);
        }
      });
    }
  };
}