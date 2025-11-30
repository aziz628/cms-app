import { 
  CLASSES, 
  PRICING_PLANS, 
  PRICING_FEATURES, 
  TRAINERS, 
  GALLERY_CATEGORY, 
  REVIEWS, 
  EVENTS, 
  TRANSFORMATIONS, 
  SOCIAL_MEDIA_LINKS, 
  BUSINESS_HOURS
 } from '../../DB/db_constants.js';
 
const fake_data = {
  [CLASSES.TABLE_NAME]: [
    {"name": "Yoga", "description": "Relaxing yoga classes", "private_coaching": false},
    {"name": "Weight Training", "description": "Build muscle", "private_coaching": true},
    {"name": "Cardio", "description": "High-energy cardio", "private_coaching": false},
    {"name": "HIIT", "description": "Intense interval training", "private_coaching": true},
    {"name": "Pilates", "description": "Core strengthening", "private_coaching": false}
  ],
  [PRICING_PLANS.TABLE_NAME]: [
    {"name": "Basic", "price": 29.99, "period": "monthly", "description": "Basic access", "popular": false},
    {"name": "Premium", "price": 59.99, "period": "monthly", "description": "Full access", "popular": true},
    {"name": "Elite", "price": 99.99, "period": "monthly", "description": "VIP access", "popular": false}
  ],
  [PRICING_FEATURES.TABLE_NAME]: [
    {"feature": "Unlimited classes"},
    {"feature": "Personal trainer"},
    {"feature": "Priority booking"},
    {"feature": "Guest passes"},
    {"feature": "Nutrition plan"}
  ],
  [TRAINERS.TABLE_NAME]: [
    {"name": "John Doe", "speciality": "Weight Training", "certificate": "NASM", "years_of_experience": 5},
    {"name": "Jane Smith", "speciality": "Yoga", "certificate": "RYT-200", "years_of_experience": 8},
    {"name": "Mike Johnson", "speciality": "Cardio", "certificate": "ACE", "years_of_experience": 3},
    {"name": "Sarah Williams", "speciality": "HIIT", "certificate": "NASM", "years_of_experience": 6}
  ],
  [GALLERY_CATEGORY.TABLE_NAME]: [
    {"name": "Before & After"},
    {"name": "Facility"},
    {"name": "Events"},
    {"name": "Equipment"}
  ],
  [REVIEWS.TABLE_NAME]: [
    {"author": "Client A", "content": "Great experience!", "identity": "member"},
    {"author": "Client B", "content": "Best trainers!", "identity": "member"},
    {"author": "Client C", "content": "Highly recommend", "identity": "guest"},
    {"author": "Client D", "content": "Amazing gym", "identity": "member"}
  ],
  [EVENTS.TABLE_NAME]: [
    {"title": "Summer Bootcamp", "description": "Intensive training", "location": "Main Studio", "date": 1704067200},
    {"title": "Yoga Retreat", "description": "Relaxation weekend", "location": "Outdoor", "date": 1711929600},
    {"title": "Fitness Challenge", "description": "30-day challenge", "location": "All areas", "date": 1719792000},
    {"title": "New Year Special", "description": "Special pricing", "location": "Main Studio", "date": 1735689600}
  ],
  [TRANSFORMATIONS.TABLE_NAME]: [
    {"name": "Client Success 1", "description": "3-month transformation"},
    {"name": "Client Success 2", "description": "6-month journey"},
    {"name": "Client Success 3", "description": "Amazing results"},
    {"name": "Client Success 4", "description": "Complete overhaul"}
  ],
  [SOCIAL_MEDIA_LINKS.TABLE_NAME]: [
    {"platform": "instagram", "link": "https://instagram.com/yourpage"},
    {"platform": "facebook", "link": "https://facebook.com/yourpage"},
    {"platform": "twitter", "link": "https://twitter.com/yourpage"}
  ],
  [BUSINESS_HOURS.TABLE_NAME]: [
    {"day": "monday", "open_time": "06:00", "close_time": "22:00"},
    {"day": "tuesday", "open_time": "06:00", "close_time": "22:00"},
    {"day": "wednesday", "open_time": "06:00", "close_time": "22:00"},
    {"day": "thursday", "open_time": "06:00", "close_time": "22:00"},
    {"day": "friday", "open_time": "06:00", "close_time": "23:00"},
    {"day": "saturday", "open_time": "08:00", "close_time": "20:00"},
    {"day": "sunday", "open_time": "08:00", "close_time": "20:00"}
  ]
}
export default fake_data;