function async_handler(fn) {
    return (req, res, next) => {
        // run the async function inside a resolved promise and catch any errors
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
function async_controller(obj) {
    return Object.fromEntries(Object.entries(obj).map(([key, fn]) => [key, async_handler(fn)]));
}
export { async_controller, async_handler };