import create_migration from "../helper/migration_template.js";
import {DASHBOARD} from '../db_constants.js';

import { GALLERY_IMAGE, SCHEDULE, EVENTS, REVIEWS, PRICING_FEATURES, ADMIN } from "../db_constants.js";

export default create_migration({
    upQueries: [
       // Gallery queries (HIGH TRAFFIC )
    `CREATE INDEX IF NOT EXISTS idx_gallery_image_category ON ${GALLERY_IMAGE.TABLE_NAME}(${GALLERY_IMAGE.CATEGORY_ID})`,
      
    // Schedule lookups (FREQUENT - display on front-end)
    `CREATE INDEX IF NOT EXISTS idx_schedule_class ON ${SCHEDULE.TABLE_NAME}(${SCHEDULE.CLASS_ID})`,
    `CREATE INDEX IF NOT EXISTS idx_schedule_day ON ${SCHEDULE.TABLE_NAME}(${SCHEDULE.DAY_OF_WEEK})`,
    
    // Reviews/Events listing (POPULAR READS)
    `CREATE INDEX IF NOT EXISTS idx_event_date ON ${EVENTS.TABLE_NAME}(${EVENTS.DATE})`,
    `CREATE INDEX IF NOT EXISTS idx_reviews_created ON ${REVIEWS.TABLE_NAME}(${REVIEWS.CREATED_AT})`,
    
    // Pricing lookups (MODERATE)
    `CREATE INDEX IF NOT EXISTS idx_pricing_plan ON ${PRICING_FEATURES.TABLE_NAME}(${PRICING_FEATURES.PLAN_ID})`,
    
    // Admin auth (CRITICAL - every request)
    `CREATE INDEX IF NOT EXISTS idx_admin_username ON ${ADMIN.TABLE_NAME}(${ADMIN.USERNAME})`
    ],
    downQueries: [
      `DROP INDEX IF EXISTS idx_gallery_image_category`,
      `DROP INDEX IF EXISTS idx_schedule_class`,
      `DROP INDEX IF EXISTS idx_schedule_day`,
      `DROP INDEX IF EXISTS idx_event_date`,
      `DROP INDEX IF EXISTS idx_reviews_created`,
      `DROP INDEX IF EXISTS idx_pricing_plan`,
      `DROP INDEX IF EXISTS idx_admin_username`
    ]
})