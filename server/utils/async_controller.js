/*
    * Wraps an async function to catch errors and pass them to next()
*/
function async_handler(fn) {
    return (req, res, next) => {
        // run the async function inside a resolved promise and catch any errors
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

// name will be changed to "wrap_async_functions" in future refactor
/* Converts all functions in an object to async handlers */
function async_controller(obj) {
    return Object.fromEntries(Object.entries(obj).map(([key, fn]) => [key, async_handler(fn)]));
}
export { async_controller, async_handler };