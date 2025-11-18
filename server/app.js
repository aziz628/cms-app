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
import public_routes from './routes/public.js';

import errorHandler from './middleware/errorHandler.js';
import { authenticate_session } from './middleware/auth_middleware.js';
import db from './DB/db_connection.js';
import fs from 'fs/promises';

const DEFAULT_HERO_IMAGE=process.env.DEFAULT_HERO_IMAGE;
const DEFAULT_ABOUT_IMAGE=process.env.DEFAULT_ABOUT_IMAGE;
const TEMPLATE_IMAGES_DIR=process.env.TEMPLATE_DIR ||'public/img';

// Create Express app
const app = express();

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR_PATH =  process.env.UPLOAD_BASE || '/uploads';


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
            "http://192.168.1.12:3001",
        ],        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,}));


// Serve static files (CSS, JS, images):

//  when URL is '/assets/<requested_file_path>'
// express looks in 'public/<requested_file_path>'
app.use('/assets', publicLimiter, express.static(path.join(__dirname, 'public')));


// Serve the images from the uploads directory
// directory is at the root level
const UPLOAD_BASE = process.env.UPLOAD_BASE || '/uploads';
app.use('/uploads', publicLimiter,express.static(path.join(__dirname, UPLOAD_BASE)));

app.use(globalLimiter); // Add global rate limiting to all routes



// morgan for logging HTTP requests 
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// Parse JSON bodies (as sent by API clients)
app.use(express.json());


// Parse URL-encoded bodies (as sent by HTML forms , commented until we add template emails)
// app.use(express.urlencoded({ extended: true }));

// Views routes (EJS templates)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Mount public routes BEFORE API routes
app.use('/', public_routes);

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

// Admin health check route - detailed status for admins
app.get('/api/admin/health', authenticate_session, async (req, res) => {
    
    const healthCheck = {
        status: 'healthy',
        // datetime timestamp
        timestamp: new Date().toISOString(),
        uptime: process.uptime()+' seconds',
        checks: {}
    };

    try {
        // Database check with details
        if (db) {
            await db.get('SELECT 1');
            healthCheck.checks.database = {
                status: 'connected',
                type: 'sqlite'
            };
        } else {
            healthCheck.checks.database = { status: 'no connection' };
            healthCheck.status = 'degraded';
        }

        // File system check
        
        // Check if uploads directory exists and is accessible
        try {
            await fs.access(UPLOAD_DIR_PATH);
            const stats = await fs.stat(UPLOAD_DIR_PATH);
            healthCheck.checks.filesystem = {
                status: 'accessible',
                uploadsDirectory: UPLOAD_DIR_PATH,
                lastModified: stats.mtime
            };
        } catch (fsError) {
            healthCheck.checks.filesystem = { 
                status: 'missing uploads directory',
                path: UPLOAD_DIR_PATH
            };
            healthCheck.status = 'degraded';
        }
        // Memory usage
        const memUsage = process.memoryUsage();
        healthCheck.checks.memory = {
            heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
            rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`
        };

        if(process.env.NODE_ENV == 'development') {
            console.log(healthCheck);
        }
        res.status(200).json(healthCheck);
    } catch (error) {
        healthCheck.checks.database = 'disconnected';
    }

});

// public health check route - basic status
app.get('/api/health', publicLimiter, async (req, res) => {
    try {
        // Simple DB query to check connectivity
        await db.get('SELECT 1');
        console.log(process.env.NODE_ENV);
        if(process.env.NODE_ENV == 'development') {
            console.log('Health check OK');
        }
        // If successful, respond with OK status
        res.status(200).json({ status: 'OK', timestamp: Date.now()  });
        
    } catch (error) {
        res.status(500).json({ status: 'Error', timestamp: Date.now() });
    }
})


// AFTER all API routes, serve the React app static files
// Assuming your React build is in a 'frontend/dist' folder
app.use(express.static(path.join(__dirname, './dist')));


// check if the requested file is default image for template sections
app.use('/uploads/general_info/:imageName', async (req, res, next) => {
    const { imageName } = req.params;

    if (imageName === DEFAULT_ABOUT_IMAGE) {
        // If the requested image is the default about image, serve it
        const filePath = path.join(__dirname, TEMPLATE_IMAGES_DIR,  DEFAULT_ABOUT_IMAGE);
        return res.sendFile(filePath);
    }
    if(imageName === DEFAULT_HERO_IMAGE){
        // If the requested image is the default hero image, serve it
        const filePath = path.join(__dirname, TEMPLATE_IMAGES_DIR,  DEFAULT_HERO_IMAGE);
        return res.sendFile(filePath);
    }

    next();
});


// For any other route, send the React app's index.html
// This enables client-side routing with React Router and redirect to 404 page
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './dist', 'index.html'));
});

/*

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
