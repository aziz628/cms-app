
const PAGE_SIZE = parseInt(process.env.PAGE_SIZE) || 10;

/**
 * Get pagination metadata for a table
 * @param {Object} db - Database connection
 * @param {string} tableName - Table name
 * @returns {Promise<Object>} { totalPages }
 */
 async function get_total_pages(db, tableName) {
  const count_result = await db.get(`SELECT COUNT(*) as count FROM ${tableName}`);
  const total = count_result.count;
  const total_pages = Math.ceil(total / PAGE_SIZE);

  return total_pages;
}

export { get_total_pages, PAGE_SIZE };