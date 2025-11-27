import express from 'express';
import general_info_service from '../services/general_info_service.js';
import classes_service from '../services/classes_service.js';
import pricing_service from '../services/pricing_service.js';
import events_service from '../services/events_service.js';
import transformation_service from '../services/transformation_service.js';
import review_service from '../services/review_service.js';
import contact_service from '../services/contact_service.js';
import trainer_service from '../services/trainers_service.js'
import gallery_service from '../services/gallery_service.js';

const router = express.Router();
const PLATFORMS = {'facebook':"fa-facebook", 'instagram':"fa-instagram", 'twitter':"fa-twitter", 'youtube':"fa-youtube", 'linkedin':"fa-linkedin", 'tiktok':"fa-tiktok", 'pinterest':"fa-pinterest", 'snapchat':"fa-snapchat"}


// Home page
router.get('/', async (req, res,next) => {
  try {
    // get the general info data , classes , pricing , schedule, contact
    let general_info = await general_info_service.get_info();
    /* data : business_hours,about_summary,about_image,hero_title ,hero_subtitle,  hero_image
       */
    let classes = await classes_service.get_all();
    /* data:  id , name , description private_coaching image  */
    let pricing = await pricing_service.get_pricing_plans();
    // data :  'name','price', 'period', 'description',features, 'popular'
    let schedule = await events_service.get_all_events();
    // data : title description date , location , image
    let contact = await contact_service.get_info();
    // data : email, phone, address

    let trainers = await trainer_service.get_trainers();
    // data : id, name,years_of_experience,certificate,speciality,image

    let classes_count=classes?.length || 0;
    let trainer_count= trainers.length || 0; 

    res.render('layouts/main', {
      general_info,
      classes,
      pricing,
      schedule,
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
    const events = await events_service.get_all_events();
    let general_info = await general_info_service.get_info();

    res.render('pages/events', {
      title: 'Upcoming Events - FitnessHub',
      events: events,
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
    let general_info = await general_info_service.get_info();
    const reviews = await review_service.get_reviews();

    res.render('pages/reviews', {
      title: 'Member Reviews - FitnessHub',
      reviews,
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
    let general_info = await general_info_service.get_info();
    const transformations = await transformation_service.get_all();

    res.render('pages/transformations', {transformations, general_info});
  } catch (error) {
    console.error('Error rendering transformations page:', error);
    res.status(500).send('Server Error');
  }
});

// Trainers page
router.get('/trainers', async (req, res) => {
  try {
    const trainers = await trainer_service.get_trainers();
    let general_info = await general_info_service.get_info();
    res.render('pages/trainers', {
      title: 'Our Trainers - FitnessHub',
      trainers,
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
    const gallery = await gallery_service.get_all_categories_and_images();
    let general_info = await general_info_service.get_info();
    console.log(gallery);

    res.render('pages/gallery', {
      title: 'Gallery - FitnessHub',
      gallery,
      general_info
    });
  } catch (error) {
    console.error('Error rendering gallery page:', error);
    res.status(500).send('Server Error');
  }
});


export default router;
