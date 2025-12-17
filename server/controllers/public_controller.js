import general_info_service from '../services/general_info_service.js';
import classes_service from '../services/classes_service.js';
import pricing_service from '../services/pricing_service.js';
import events_service from '../services/events_service.js';
import schedule_service from '../services/schedule_service.js';
import transformation_service from '../services/transformation_service.js';
import review_service from '../services/review_service.js';
import contact_service from '../services/contact_service.js';
import trainer_service from '../services/trainers_service.js'
import gallery_service from '../services/gallery_service.js';
import computeLayout from '../services/public_schedule_service.js';
import { getCount } from '../services/helper/crud_helper.js';
import db from '../DB/db_connection.js';

const PLATFORMS = { 'facebook': "fa-facebook", 'instagram': "fa-instagram", 'twitter': "fa-twitter", 'youtube': "fa-youtube", 'linkedin': "fa-linkedin", 'tiktok': "fa-tiktok", 'pinterest': "fa-pinterest", 'snapchat': "fa-snapchat" }


// Home page
async function get_home_page(req, res) {
    // get pages number from query    
    const class_page = parseInt(req.query.class_page) || 1;
    const pricing_page = parseInt(req.query.pricing_page) || 1;
    const pages = { class_page, pricing_page };

    // get the needed data for home page
    let general_info = await general_info_service.get_info();
    let classes = await classes_service.get_all(class_page);
    let pricing = await pricing_service.get_pricing_plans(pricing_page);
    let contact = await contact_service.get_info();
    let schedule = await schedule_service.get_schedule();

    // compute the layout for schedule
    const layout = computeLayout(schedule);

    let classes_count = await getCount(db, 'classes');
    let trainer_count = await getCount(db, 'trainers');

    res.render('layouts/main', {
      general_info,
      classes: classes.data,
      pricing: pricing.data,
      ...layout,
      pages,
      classes_pagination: {
        totalPages: classes.total_pages,
        pageSize: classes.PAGE_SIZE
      },
      pricing_pagination: {
        totalPages: pricing.total_pages,
        pageSize: pricing.PAGE_SIZE
      },
      contact,
      classes_count,
      trainer_count,
      PLATFORMS,
      home_page: true // for custom js files
    });
}

// Events page
async function get_events_page(req, res) {
    const page = parseInt(req.query.page) || 1;
    const events = await events_service.get_all_events(page);
    let general_info = await general_info_service.get_info();

    res.render('pages/events', {
      title: 'Upcoming Events - FitnessHub',
      events: events.data,
      page,
      totalPages: events.total_pages,
      pageSize: events.PAGE_SIZE,
      general_info
    });
}

// Reviews page
async function get_reviews_page(req, res) {
    const page = parseInt(req.query.page) || 1;

    let general_info = await general_info_service.get_info();
    const reviews = await review_service.get_reviews(page);

    res.render('pages/reviews', {
      title: 'Member Reviews - FitnessHub',
      reviews: reviews.data,
      page,
      totalPages: reviews.total_pages,
      pageSize: reviews.PAGE_SIZE,
      general_info
    });
}

// Transformations page
async function get_transformations_page(req, res) {
    const page = parseInt(req.query.page) || 1;

    let general_info = await general_info_service.get_info();
    const transformations = await transformation_service.get_all(page);

    res.render('pages/transformations', {
      transformations: transformations.data,
      page,
      totalPages: transformations.total_pages,
      pageSize: transformations.PAGE_SIZE,
      general_info
    });
}

// Trainers page
async function get_trainers_page(req, res) {

    const page = parseInt(req.query.page) || 1;

    const trainers = await trainer_service.get_trainers(page);
    let general_info = await general_info_service.get_info();
    
    res.render('pages/trainers', {
      title: 'Our Trainers - FitnessHub',
      trainers: trainers.data,
      page,
      totalPages: trainers.total_pages,
      pageSize: trainers.PAGE_SIZE,
      general_info
    });
}

// Gallery page
async function get_gallery_page(req, res) {
    const page = parseInt(req.query.page) || 1;
    
    const gallery = await gallery_service.get_all_categories_and_images(page);
    let general_info = await general_info_service.get_info();
    

    res.render('pages/gallery', {
      title: 'Gallery - FitnessHub',
      gallery,
      page,
      totalPages: gallery.total_pages,
      pageSize: gallery.PAGE_SIZE,
      general_info
    });
}


export default {
    get_home_page,
    get_events_page,
    get_reviews_page,
    get_transformations_page,
    get_trainers_page,
    get_gallery_page
};