import express from 'express';
import auth_controller from '../../controllers/auth_controller.js';
import {wrap_all_async_functions } from "../../utils/async_controller.js"
import { authenticate_session } from '../../middleware/auth_middleware.js';
import auth_validator from '../../middleware/validators/auth_validator.js';
import {
authLimiter,adminLimiter
} from '../../middleware/rate_limiter.js';

// Wrap controller functions and validators as async handlers
const {
    login,
    logout,
    update_password,
    update_username,
    get_user_info
} = wrap_all_async_functions(auth_controller);
const {
    login_validator,
    username_update_validator,
    password_update_validator
} = wrap_all_async_functions(auth_validator);

const router = express.Router();

// login
router.post('/login',(req,res,next)=>{
    if(process.env.NODE_ENV !== 'test') {
        authLimiter(req, res, next)
     }
    else next();
}, login_validator, login); // public route


// logout (no strict rate limiting)
router.post('/logout', authenticate_session, logout);// protected route

router.use(adminLimiter); // apply admin rate limiter to all routes below

// password update
router.post('/password_update', authenticate_session, password_update_validator, update_password);

// update username
router.post('/username_update', authenticate_session, username_update_validator, update_username);

// me
router.get('/me', authenticate_session, get_user_info);


export default router;
