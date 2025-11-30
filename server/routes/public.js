import express from 'express';
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
import  computeLayout  from '../services/public_schedule_service.js';
import {getCount} from '../services/helper/crud_helper.js';
import db from '../DB/db_connection.js';
const router = express.Router();
const PLATFORMS = {'facebook':"fa-facebook", 'instagram':"fa-instagram", 'twitter':"fa-twitter", 'youtube':"fa-youtube", 'linkedin':"fa-linkedin", 'tiktok':"fa-tiktok", 'pinterest':"fa-pinterest", 'snapchat':"fa-snapchat"}


// Home page
router.get('/', async (req, res,next) => {
  try {
    const page = parseInt(req.query.page) || 1;

    let general_info = await general_info_service.get_info();

    let classes = await classes_service.get_all(page);

    let pricing = await pricing_service.get_pricing_plans(page);

    let schedule = await schedule_service.get_schedule();

    const layout = computeLayout(schedule);

    let contact = await contact_service.get_info();


    let classes_count=await getCount(db, 'classes');
    let trainer_count= await getCount(db, 'trainers');

    res.render('layouts/main', {
      general_info,
      classes: classes.data,
      pricing: pricing.data,
      ...layout,
      classes_pagination: {
        page,
        totalPages: classes.total_pages,
        pageSize: classes.PAGE_SIZE
      },
      pricing_pagination: {
        page,
        totalPages: pricing.total_pages,
        pageSize: pricing.PAGE_SIZE
      },
      contact,
      classes_count,
      trainer_count,
      PLATFORMS,
      home_page:true
    });
  } catch (error) {
    console.error('Error rendering home page:', error);
    next(error);
  }
});

// Events page
router.get('/events', async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error rendering events page:', error);
    res.status(500).send('Server Error');
  }
});

// Reviews page
router.get('/reviews', async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error rendering reviews page:', error);
    res.status(500).send('Server Error');
  }
});

// Transformations page
router.get('/transformations', async(req, res) => {
  try {
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
  } catch (error) {
    console.error('Error rendering transformations page:', error);
    res.status(500).send('Server Error');
  }
});

// Trainers page
router.get('/trainers', async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error rendering trainers page:', error);
    res.status(500).send('Server Error');
  }
});

// Gallery page
router.get('/gallery', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const gallery = await gallery_service.get_all_categories_and_images(page);
    let general_info = await general_info_service.get_info();
    console.log(gallery);

    res.render('pages/gallery', {
      title: 'Gallery - FitnessHub',
      gallery,
      page,
      totalPages: gallery.total_pages,
      pageSize: gallery.PAGE_SIZE,
      general_info
    });
  } catch (error) {
    console.error('Error rendering gallery page:', error);
    res.status(500).send('Server Error');
  }
});


export default router;
