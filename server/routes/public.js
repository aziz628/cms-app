import express from 'express';
import { wrap_all_async_functions } from '../utils/async_controller.js';
import public_controller from '../controllers/public_controller.js';
 const {
    get_home_page,
    get_events_page,
    get_reviews_page,
    get_transformations_page,
    get_trainers_page,
    get_gallery_page
}= wrap_all_async_functions(public_controller);

const router = express.Router();

// Home page
router.get('/', get_home_page);

// Events page
router.get('/events', get_events_page);

// Reviews page
router.get('/reviews', get_reviews_page);

// Transformations page
router.get('/transformations', get_transformations_page);

// Trainers page
router.get('/trainers', get_trainers_page);

// Gallery page
router.get('/gallery', get_gallery_page);

export default router;
