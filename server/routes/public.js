import express from 'express';
import general_info_service from '../services/general_info_service.js';
import classes_service from '../services/classes_service.js';
import pricing_service from '../services/pricing_service.js';
import events_service from '../services/events_service.js';
import transformation_service from '../services/transformation_service.js';
import review_service from '../services/review_service.js';
import contact_service from '../services/contact_service.js';
import trainer_service from '../services/trainers_service.js'


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
router.get('/events', (req, res) => {
  try {
    const events =[];

    res.render('layouts/main',{
      title: 'Upcoming Events - FitnessHub',
      events: events
    });
  } catch (error) {
    console.error('Error rendering events page:', error);
    res.status(500).send('Server Error');
  }
});

// Reviews page
router.get('/reviews', (req, res) => {
  try {
    const reviews = []

    res.render('pages/reviews', {
      title: 'Member Reviews - FitnessHub',
      reviews: reviews
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
router.get('/trainers', (req, res) => {
  try {
    const trainers = [
      {
        id: 1,
        name: 'Coach James Anderson',
        specialization: 'Strength & Conditioning',
        bio: 'With 10+ years of experience in strength training, James helps clients build muscle and achieve their strength goals safely and effectively.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
        social_instagram: 'coachJamesA',
        social_twitter: 'coachJamesA'
      },
      {
        id: 2,
        name: 'Sarah Mitchell',
        specialization: 'Yoga & Flexibility',
        bio: 'Certified yoga instructor with a passion for helping clients improve flexibility and mental wellness. Sarah creates personalized programs for all levels.',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
        social_instagram: 'sarahYogaMitchell',
        social_facebook: 'SarahMitchellYoga'
      },
      {
        id: 3,
        name: 'Marcus Thompson',
        specialization: 'Cardio & HIIT',
        bio: 'High-energy trainer specializing in cardio workouts and HIIT training. Marcus will push you to your limits and help you exceed your fitness potential.',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
        social_instagram: 'marcusCardioKing',
        social_twitter: 'MarcusCardio'
      },
      {
        id: 4,
        name: 'Emma Rodriguez',
        specialization: 'Weight Loss & Nutrition',
        bio: 'Certified nutritionist and personal trainer. Emma combines nutrition coaching with fitness training to help clients achieve sustainable weight loss results.',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300',
        social_instagram: 'emmaFitnessNutrition',
        social_facebook: 'EmmaRodriguezFitness'
      },
      {
        id: 5,
        name: 'David Lopez',
        specialization: 'CrossFit & Functional Fitness',
        bio: 'Former athlete and CrossFit specialist. David designs functional training programs that improve real-world strength and athletic performance.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
        social_instagram: 'davidCrossFitLopez',
        social_twitter: 'DavidCrossFit'
      },
      {
        id: 6,
        name: 'Jessica Chen',
        specialization: 'Women\'s Fitness & Boxing',
        bio: 'Empowering women through fitness and boxing. Jessica specializes in building confidence and strength in female clients of all fitness levels.',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
        social_instagram: 'jessicaBoxingChampion',
        social_facebook: 'JessicaChenFitness'
      }
    ];

    res.render('pages/trainers', {
      title: 'Our Trainers - FitnessHub',
      trainers: trainers
    });
  } catch (error) {
    console.error('Error rendering trainers page:', error);
    res.status(500).send('Server Error');
  }
});

// Gallery page
router.get('/gallery', (req, res) => {
  try {
    const galleryImages = [
      {
        id: 1,
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
        title: 'Group Training',
        category: 'Classes'
      },
      {
        id: 2,
        image: 'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=400',
        title: 'Women\'s Strength',
        category: 'Training'
      },
      {
        id: 3,
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
        title: 'Personal Training',
        category: 'Training'
      },
      {
        id: 4,
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
        title: 'Yoga Session',
        category: 'Classes'
      },
      {
        id: 5,
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400',
        title: 'Fitness Event',
        category: 'Events'
      },
      {
        id: 6,
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
        title: 'Cardio Zone',
        category: 'Facilities'
      },
      {
        id: 7,
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
        title: 'Flexibility Training',
        category: 'Classes'
      },
      {
        id: 8,
        image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400',
        title: 'Strength Equipment',
        category: 'Facilities'
      }
    ];

    res.render('pages/gallery', {
      title: 'Gallery - FitnessHub',
      images: galleryImages
    });
  } catch (error) {
    console.error('Error rendering gallery page:', error);
    res.status(500).send('Server Error');
  }
});


export default router;
