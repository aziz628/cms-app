import express from 'express';
import auth_controller from '../../controllers/auth_controller.js';
import {wrap_all_async_functions } from "../../utils/async_controller.js"
import { authenticate_session } from '../../middleware/auth_middleware.js';
import auth_validator from '../../middleware/validators/auth_validator.js';
import {
authLimiter,adminLimiter
} from '../../middleware/rate_limiter.js';

// Wrap controller functions and validators as async handlers
const { login, logout, update_password, update_username } = wrap_all_async_functions(auth_controller);
const {
    login_validator,
    username_update_validator,
    password_update_validator
} = wrap_all_async_functions(auth_validator);

const router = express.Router();


// logout
router.post('/logout', authLimiter, authenticate_session, logout);// protected route

// Apply rate limiting
router.use((req,res,next)=>{
    if(process.env.NODE_ENV !== 'test') {
        authLimiter(req, res, next)
     }
    else next();
});

// login
router.post('/login', login_validator, login); // public route

// password update
router.post('/password_update', authenticate_session, password_update_validator, update_password);

// update username
router.post('/username_update', authenticate_session, username_update_validator, update_username);

export default router;
