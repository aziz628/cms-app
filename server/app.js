import './config/load_env.js'; // Load environment variables first
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  authLimiter,
  adminLimiter,
  publicLimiter,
  globalLimiter
} from './middleware/rate_limiter.js';
import  auth_route from './routes/api/auth_route.js';
import admin_route from './routes/api/admin_route.js';
import errorHandler from './middleware/errorHandler.js';
import { authenticate_session } from './middleware/auth_middleware.js';

// Create Express app
const app = express();

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Middleware
app.use(helmet());
app.use(cookieParser());


// Enable CORS with specific origins and methods
app.use(cors({
        origin: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ],        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,}));


// Serve static files (CSS, JS, images):
//  when URL is '/assets/<requested_file_path>'
// express looks for file in 'public/<requested_file_path>'
app.use('/assets', publicLimiter, express.static(path.join(__dirname, 'public')));

// Serve static files from the uploads directory
// supposing that directory is at the root level
const UPLOAD_BASE = process.env.UPLOAD_BASE || '/uploads';
app.use('/uploads', publicLimiter,express.static(path.join(__dirname, UPLOAD_BASE)));

app.use(globalLimiter); // Add global rate limiting to all routes



// morgan for logging HTTP requests 
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// Parse JSON bodies (as sent by API clients)
app.use(express.json());


// Parse URL-encoded bodies (as sent by HTML forms but we don't use it now)
// app.use(express.urlencoded({ extended: true }));

/*
// Views routes (EJS templates)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Public site pages
// Uncomment the following lines to enable rendering of EJS pages
app.get('/', (req, res) => {
    res.render('pages/index');
});
app.get('/gallery', (req, res) => {
    res.render('pages/gallery');
});
*/


// API Routes
app.use('/api/auth', (req, res, next) => {
    if(process.env.NODE_ENV !== 'test') {
        return authLimiter(req, res, next)
     }
    next();
}, auth_route);

// Base route
app.use('/api/admin', (req,res,next)=>{adminLimiter
    if(process.env.NODE_ENV !== 'test') {
        adminLimiter(req, res, next)
     }
    else next();
}, authenticate_session, admin_route);


// AFTER all API routes, serve the React app static files
// Assuming your React build is in a 'frontend/dist' folder
app.use(express.static(path.join(__dirname, './dist')));

// For any other route, send the React app's index.html
// This enables client-side routing with React Router
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './dist', 'index.html'));
});
/*

// Handle 404 errors for unmatched routes
// This will handle both API and non-API routes
app.use((req, res) => {
    // Check if request expects JSON (XHR or Accept header includes application/json)
    const expectsJson = req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'));
    
    if (expectsJson) {
        return res.status(404).json({ message: 'Page not found' });
    } else {
        // For all other requests, render HTML error page
        // render function 
        return res.status(404).sendFile(path.join(__dirname, 'public', "static", "error.html"));
    }
});
*/
// Error handling middleware
app.use(errorHandler);  

export default app;
