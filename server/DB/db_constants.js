/**
 * Database Table Names & Columns
 * Central location for all table and column constants to avoid inconsistencies
 */

const ADMIN = {
  TABLE_NAME: 'admin',
  USERNAME: 'username',
  PASSWORD: 'password',
  SESSION_ID: 'session_id'
};

const CLASSES = {
  TABLE_NAME: 'classes',
  ID: 'id',
  NAME: 'name',
  DESCRIPTION: 'description',
  PRIVATE_COACHING: 'private_coaching',
  IMAGE: 'image'
};

const SCHEDULE = {
  TABLE_NAME: 'schedule',
  ID: 'id',
  START_TIME: 'start_time',
  END_TIME: 'end_time',
  DAY_OF_WEEK: 'day_of_week',
  CLASS_ID: 'class_id'
};

const PRICING_PLANS = {
  TABLE_NAME: 'pricing_plans',
  ID: 'id',
  NAME: 'name',
  PRICE: 'price',
  PERIOD: 'period',
  DESCRIPTION: 'description',
  POPULAR: 'popular'
};

const PRICING_FEATURES = {
  TABLE_NAME: 'pricing_features',
  ID: 'id',
  PLAN_ID: 'plan_id',
  FEATURE: 'feature'
};

const TRAINERS = {
  TABLE_NAME: 'trainers',
  ID: 'id',
  NAME: 'name',
  SPECIALITY: 'speciality',
  CERTIFICATE: 'certificate',
  YEARS_OF_EXPERIENCE: 'years_of_experience',
  IMAGE: 'image'
};

const GALLERY_CATEGORY = {
  TABLE_NAME: 'gallery_category',
  ID: 'id',
  NAME: 'name'
};

const GALLERY_IMAGE = {
  TABLE_NAME: 'gallery_image',
  ID: 'id',
  NAME: 'name',
  DESCRIPTION: 'description',
  FILENAME: 'filename',
  CATEGORY_ID: 'category_id'
};

const REVIEWS = {
  TABLE_NAME: 'reviews',
  ID: 'id',
  AUTHOR: 'author',
  CONTENT: 'content',
  IMAGE: 'image',
  IDENTITY: 'identity',
  CREATED_AT: 'created_at'
};

const EVENTS = {
  TABLE_NAME: 'event',
  ID: 'id',
  TITLE: 'title',
  DESCRIPTION: 'description',
  DATE: 'date',
  LOCATION: 'location',
  IMAGE: 'image'
};

const TRANSFORMATIONS = {
  TABLE_NAME: 'transformations',
  ID: 'id',
  NAME: 'name',
  DESCRIPTION: 'description',
  BEFORE_IMAGE: 'before_image',
  AFTER_IMAGE: 'after_image'
};

const CONTACT = {
  TABLE_NAME: 'contact',
  ADDRESS: 'address',
  PHONE_NUMBER: 'phone_number',
  EMAIL: 'email'
};

const SOCIAL_MEDIA_LINKS = {
  TABLE_NAME: 'social_media_link',
  ID: 'id',
  PLATFORM: 'platform',
  LINK: 'link'
};

const GENERAL_INFO = {
  TABLE_NAME: 'general_info',
  ABOUT_SUMMARY: 'about_summary',
  ABOUT_IMAGE: 'about_image',
  HERO_TITLE: 'hero_title',
  HERO_SUBTITLE: 'hero_subtitle',
  HERO_IMAGE: 'hero_image'
};

const BUSINESS_HOURS = {
  TABLE_NAME: 'business_hour',
  ID: 'id',
  DAY: 'day',
  OPEN_TIME: 'open_time',
  CLOSE_TIME: 'close_time'
};

const DASHBOARD = {
  TABLE_NAME: 'admin_log',
  ID: 'id',
  TIMESTAMP: 'timestamp',
  ACTION: 'action',
  ICON: 'icon'
};

export { ADMIN, CLASSES, SCHEDULE, PRICING_PLANS, PRICING_FEATURES, TRAINERS, GALLERY_CATEGORY, GALLERY_IMAGE, REVIEWS, EVENTS, TRANSFORMATIONS, CONTACT, SOCIAL_MEDIA_LINKS, GENERAL_INFO, BUSINESS_HOURS, DASHBOARD };