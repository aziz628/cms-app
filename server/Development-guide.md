# Development Guide

This guide explains how to run, debug, and test the Gym Website CMS.

## Environment Setup

### Prerequisites

- Node.js 14+ and npm
- Git
- VS Code (recommended)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd gym-website-cms
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file in the server directory with the following variables:

```
PORT=3000
NODE_ENV=development
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=your_bcrypt_hash_here
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

To generate a bcrypt hash for your admin password, you can use the hash generator in root of server

## Running the Application

### Development Mode

```bash
npm run dev
```

This will start the server with nodemon for automatic reloading on file changes.

### Production Mode

```bash
npm start
```

### Available Scripts

### Available Scripts

The following npm scripts are available in `package.json`:

- `start`: Start server in production mode
- `lint`: Run ESLint to check code quality
- `test`: Run Jest tests with experimental VM modules
- `prettier`: Check code formatting with Prettier
- `migrate`: Run all database migrations
- `undo-migrate`: Undo all database migrations

## Memory Monitoring

The application includes memory monitoring capabilities to help track memory usage, especially for file upload operations which can be memory-intensive.

### Using the Memory Monitor Middleware

The `memory_monitor` middleware tracks memory usage during request processing:

```javascript
// Add memory monitoring to routes with file uploads
router.post("/classes", memory_monitor, upload_middleware, create_class_with_upload, classes_controller.add_class);
```

This middleware logs memory usage at the beginning and end of the request, showing:

- RSS (Resident Set Size): Total memory allocated to the Node.js process
- Heap Total: Memory reserved by V8 for objects
- Heap Used: Memory currently used by JavaScript objects
- External: Memory used by C++ objects (like file buffers)

### Expected Memory Patterns

For file uploads (typically images):

- Heap Used increase: ~0.7-0.9 MB per request
- External memory increase: ~1 MB during file processing
- Total RSS increase: ~1.5-1.7 MB

These values are normal and do not indicate memory leaks. The application is designed to efficiently handle file uploads by:

1. Storing files temporarily in memory using Multer
2. Validating request data
3. Saving files to disk only if validation passes
4. Explicitly freeing memory by nullifying file buffers

### Memory Constraints

When deploying to environments with limited memory (e.g., Railway with 1GB RAM):

- File size limits are set to 5MB by default
- Memory is properly released after file processing
- The application can handle multiple concurrent uploads

## File Handling Architecture

The application uses a structured middleware approach to handle file uploads securely and efficiently.

### File Handling Middleware

The file handling system consists of three main middleware components:

1. **memory_upload**: Handles initial file upload using Multer's memory storage

   - Configures file size limits (5MB by default)
   - Stores uploaded files in memory temporarily
   - Available via `file_middleware.js`
2. **file_validator**: Validates uploaded files

   - Checks file types (limited to images by default)
   - Verifies file size constraints
   - Ensures file integrity
   - Available via `file_validator_middleware.js`
3. **file_saver**: Saves validated files to the filesystem

   - Generates unique filenames to prevent conflicts
   - Creates necessary directories if they don't exist
   - Optimizes file storage for performance
   - Available via `file_middleware.js`

### Usage in Routes

To implement file upload handling in routes use the pipeline factory exported from `file_middleware.js` (it builds the memory upload → schema validator → file validator → saver chain):

```javascript

// Example (use the pipeline created with create_upload_pipeline)
import { create_upload_pipeline } from'../middleware/file_middleware.js';

// create a route-specific pipeline (example for classes)

constadd_class_pipeline = create_upload_pipeline({
  validator:create_class_validator, // Joi validator middleware
  section:"classes",
  uploadMode:"single",     // or "fields"
  field_name:"image"       // or file_fields for fields mode
});

router.post("/classes", memory_monitor, add_class_pipeline, classes_controller.add_class);
```

### Error Handling

The file handling middleware includes robust error handling:

- Invalid file types return appropriate 400 error responses
- File size violations return 413 (Payload Too Large) responses
- File system errors are caught and logged properly
- Memory is properly freed even when errors occur

## Testing the Application

### Manual Testing with Postman

1. **Setting Up Postman**:Import the provided Postman collection

   - Set up environment variables for:
     - `baseUrl`: `http://localhost:3000/api`
2. **Authentication Flow Testing**:

   - Login using admin credentials
   - Verify token is stored in cookies
   - Test protected routes with and without authentication
3. **Content CRUD Testing**:

   - Test each endpoint for all content types
   - Verify validation errors are returned as expected
   - Test edge cases (empty values, wrong types)
4. **File Upload Testing**:

   - Test file uploads with valid and invalid file types
   - Verify file size limits are enforced
   - Test concurrent uploads to check memory handling
   - Confirm proper file storage and retrieval

### Automated Testing with Jest

#### Setting Up Jest

1. Install Jest and testing dependencies:

```bash
npm install --save-dev jest supertest
```

2. Add test script to package.json:

```json
"scripts": {
   "test": "cross-env  NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules jest  --runInBand" 
}
```

3. add  jest config in package.json:

```json
"jest":{
    "globalSetup": "./__tests__/setup/jest.global_setup.js",
    "globalTeardown": "./__tests__/setup/jest.global_teardown.js"
    ,"testMatch": ["**/__tests__/**/*.test.[jt]s?(x)"],
    "testPathIgnorePatterns": [
      "<rootDir>/__tests__/helper/",
      "<rootDir>/__tests__/setup/"
    ]
  }
```

#### Writing Tests

Create tests in a `__tests__` directory with the following structure:

```
__tests__/
├── integration/       # End-to-end API tests
│   ├── auth.test.js
│   ├── general.test.js
│   └── ...
└── unit/             # Unit tests for services
    ├── authService.test.js
    ├── contentService.test.js
    └── ...
```

Sample test for authentication:

// to add

Sample test for file uploads:

```javascript
// to add
```

#### Running Tests

```bash
npm test
```

For watching file changes during test development:

```bash
npm test -- --watch
```

## Debugging Techniques

### Using VS Code Debugger

1. Create a `.vscode/launch.json` file:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/server.js",
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Tests",
      "program": "${workspaceFolder}/node_modules/jest/bin/jest.js",
      "args": ["--runInBand"]
    }
  ]
}
```

2. Set breakpoints in your code by clicking in the gutter next to line numbers
3. Press F5 to start debugging
4. Use the Debug Console to inspect variables and run commands

### Debugging  Issues

 **Using Monitoring Tools**:

- Morgan is configured for HTTP request logging
- Custom logger for application events
- Review admin action logs for suspicious activity

## Project Conventions

### File Structure

- Controllers should only handle request/response
- Business logic belongs in services
- Validation schemas in separate files
- Group related functionality in the same directory

### Git Workflow

1. Create feature branches from main
2. Use conventional commit messages:
   - feat: New feature
   - fix: Bug fix
   - docs: Documentation changes
   - style: Formatting changes
   - refactor: Code restructuring
   - test: Adding tests
   - chore: Maintenance tasks
3. Submit pull requests
4. Squash and merge to main

## Advanced Topics

### Adding New Content Types

1. Create a new migration file in `DB/migration` directory  
2. Run the migration using the CLI to apply database changes  
3. Create validation schema in `/middleware/validators`
4. Create service in `/services`
5. Create controller in `/controllers`
6. Add routes in `/routes/api`
7. Update admin interface (when implemented)

### Security Considerations

- JWT tokens have appropriate expiration times
- Passwords are hashed with bcrypt
- Sensitive data is not logged
- Input validation for all endpoints
- Error messages don't reveal system details

### Performance Optimization

- Use conditional ETag support for caching
- Implement pagination for large datasets
- Optimize file I/O operations
- Consider Redis for caching in production
