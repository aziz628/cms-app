import express from 'express';
import auth_controller from '../../controllers/auth_controller.js';
import {async_controller } from "../../utils/async_controller.js"
import { authenticate_session } from '../../middleware/auth_middleware.js';
import auth_validator from '../../middleware/validators/auth_validator.js';

const { login, logout,update_password,update_username } = async_controller(auth_controller);
const {
    login_validator,
    username_update_validator,
    password_update_validator
} = async_controller(auth_validator);
const router = express.Router();

// Public routes
router.post('/login', login_validator, login);

// Protected routes
router.post('/logout', authenticate_session, logout);

// password update
router.post('/password_update', authenticate_session, password_update_validator, update_password);

// update username
router.post('/username_update', authenticate_session, username_update_validator, update_username);

export default router;
