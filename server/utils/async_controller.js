/** Wraps an async function to catch errors and pass them to 
      error handling middleware.
    * @param {Function} fn - An asynchronous function (req, res, next).
    * @returns {Function} - A new function that wraps the original function.
*/
function async_handler(fn) {
    return (req, res, next) => {
        // run the async function inside a resolved promise and catch any errors
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}


/** Converts all functions in an object to async handlers 
 * @param {Object} obj - An object containing functions to be wrapped.
 * @returns {Object} - A new object with all functions wrapped as async handlers.
*/
function wrap_all_async_functions(obj) {
    return Object.fromEntries(Object.entries(obj).map(([key, fn]) => [key, async_handler(fn)]));
}
export { async_handler, wrap_all_async_functions };

