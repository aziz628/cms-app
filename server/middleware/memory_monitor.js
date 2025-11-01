/**
 * Middleware to monitor memory usage during request processing
 * Useful for tracking memory consumption during file uploads
 */
const memory_monitor = (req, res, next) => {
  // Get memory usage before processing
  const before = process.memoryUsage();
  
  // Store the original end function
  const originalEnd = res.end;
  
  // Override the end function to log memory usage after processing
  res.end = function(...args) {
    const after = process.memoryUsage();
    
    // Calculate differences in MB
    const diff = {
      rss: ((after.rss - before.rss) / 1024 / 1024).toFixed(2) + ' MB',
      heapTotal: ((after.heapTotal - before.heapTotal) / 1024 / 1024).toFixed(2) + ' MB',
      heapUsed: ((after.heapUsed - before.heapUsed) / 1024 / 1024).toFixed(2) + ' MB',
      external: ((after.external - before.external) / 1024 / 1024).toFixed(2) + ' MB',
    };
    if(process.env.NODE_ENV === 'development') {
      
    console.log(`Memory usage for ${req.method} ${req.originalUrl}:`);
    console.log(`- RSS: ${(after.rss / 1024 / 1024).toFixed(2)} MB (${diff.rss} change)`);
    console.log(`- Heap Total: ${(after.heapTotal / 1024 / 1024).toFixed(2)} MB (${diff.heapTotal} change)`);
    console.log(`- Heap Used: ${(after.heapUsed / 1024 / 1024).toFixed(2)} MB (${diff.heapUsed} change)`);
    console.log(`- External: ${(after.external / 1024 / 1024).toFixed(2)} MB (${diff.external} change)`);
    }

    // Call the original end function
    return originalEnd.apply(this, args);

    /* This ensures the original res.end function is called with the correct context (`this`) which is the response object.
    it is important because res.end may depend on properties of the response object.
    Using ".apply" preserves the context and passes all arguments correctly.
    Directly calling originalEnd(...) could break functionality due to lost context.
    */
  };

  next();
};

export default memory_monitor;