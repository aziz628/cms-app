import db from '../db_connection.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createNewStateFile } from '../../services/upload_storage_state_service.js';
import fake_data from '../../__tests__/fixtures/fake_data.js';
import { 
  CLASSES, 
  SCHEDULE, 
  PRICING_PLANS, 
  PRICING_FEATURES, 
  TRAINERS, 
  GALLERY_CATEGORY, 
  GALLERY_IMAGE, 
  REVIEWS, 
  EVENTS, 
  TRANSFORMATIONS, 
  SOCIAL_MEDIA_LINKS, 
  BUSINESS_HOURS, 
} from '../db_constants.js';

// Mapping for fake_data keys to table names


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source_image_dir = path.join(__dirname, '../../__tests__/fixtures');
const upload_dir = path.join(__dirname, '../../uploads');





async function copyTestImages(section, number) {
  try {
    const original_image_name = 'testing_image.jpg';

    // prepare source and destination paths
    const source_path = path.join(source_image_dir, original_image_name);
    const dest_dir = path.join(upload_dir, section);

    // store all file copy promises so we can await them all and handle errors
    let file_Promise = [];
    // keep track of all copied file names
    let file_names = [];

    // ensure destination directory exists
      try {
        await fs.access(dest_dir);
      } catch {
        await fs.mkdir(dest_dir, { recursive: true });
      }

    // copy n files
    for (let i = 0; i < number; i++) {
      // create unique image name
      const unique_prefix = Date.now() + '_' + Math.floor(Math.random() * 1000000000);
      const new_name = section + '_' + i + '_' + unique_prefix + '.jpg';
      const dest_path = path.join(dest_dir, new_name);

      // save copy promise
      const copy_promise = fs.copyFile(source_path, dest_path).then(() => {
        // log success message
        console.log(`Copied ${original_image_name} to ${section}/${new_name}`);

        // add image name to file names array
        file_names.push(new_name);
      }).catch(err => {
        if (err.code !== 'ENOENT') console.warn(`Warning: Could not copy to ${dest_path}:`, err.message);
      });

      // push the promise to the array
      file_Promise.push(copy_promise);
    }
    // wait all promises settled , this allow file copy to run in parallel
    await Promise.allSettled(file_Promise);
    console.log('Test images copied to all folders');
    
    return file_names;

  } catch (error) {
    console.error('Error copying images:', error);
  }
}

async function seedTableWithImages(tableName, columns, number_of_items, image_included=true,section=null) {
// saved items id
  const itemIds = [];
  // number of items 
  if(!image_included){

    for(let item of fake_data[tableName]){
      // prepare right order of columns values
      const values = columns.map(col => item[col]);
      // insert item
      const result = await db.run(
      `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
      values
      );
      itemIds.push(result.lastID);
    }
    
    return itemIds;
  }
  const fake_data_length= fake_data[tableName].length;
  number_of_items = fake_data_length * number_of_items;
  const copiedImages = await copyTestImages(section || tableName, number_of_items);

   // keep as much items as  images we have copied successfully
  for (let i = 0; i < copiedImages.length; i++) {
    // get corresponding fake data item
    const fakedatalength= fake_data[tableName].length;
    const item = fake_data[tableName][i % fakedatalength];

    // get corresponding copied image name
    const image = copiedImages[i];

    // prepare right order of columns values
    const values = columns.map(col => col === 'image' ? image : item[col]);

    const result = await db.run(
      `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
      values
    );
    itemIds.push(result.lastID);
  }
  
  console.log(`${tableName} ${itemIds.length} items inserted`);

  return itemIds;

}

async function seedDatabase() {
  try {
    console.log('Starting database seeding...\n');

    //  Classes
    console.log(`\n Inserting ${fake_data[CLASSES.TABLE_NAME].length*10} classes...`);
    let classes_columns = [CLASSES.NAME, CLASSES.DESCRIPTION, CLASSES.PRIVATE_COACHING, CLASSES.IMAGE];

    const classIds = await seedTableWithImages(CLASSES.TABLE_NAME, classes_columns, 10);

    console.log('Classes inserted');

    // 2. Pricing Plans
    console.log(`\n Inserting ${fake_data[PRICING_PLANS.TABLE_NAME].length*50} pricing plans...`);

    let plan_columns = [PRICING_PLANS.NAME, PRICING_PLANS.PRICE, PRICING_PLANS.PERIOD, PRICING_PLANS.DESCRIPTION];
    const planIds = await seedTableWithImages(PRICING_PLANS.TABLE_NAME, plan_columns, 50,false);

    console.log('Pricing plans inserted');    // 3. Pricing Features (linked to plans)
    console.log(`\n Inserting pricing features...`);

    for (const planId of planIds) {
      for (const feature of fake_data.pricing_features) {
        await db.run(
          `INSERT INTO ${PRICING_FEATURES.TABLE_NAME} (${PRICING_FEATURES.PLAN_ID}, ${PRICING_FEATURES.FEATURE}) VALUES (?, ?)`,
          [planId, feature.feature]
        );
      }
    }
    console.log('Pricing features inserted');    // 4. Schedule (linked to classes)
    console.log(`\n Inserting schedule entries...`);

    const days_of_week = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const times = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];

    for (let i = 0; i < 10; i++) {
      const classId = classIds[i % classIds.length];
      const day = days_of_week[Math.floor(Math.random() * days_of_week.length)];
      const startHour = times[Math.floor(Math.random() * times.length)];

      const [hourPart1,_ ] = startHour.split(':');
      const startTime = `${hourPart1.length==1 ? hourPart1+'0' : hourPart1}:00`;
      const hourPart2 = ((parseInt(hourPart1, 10) + 1) % 24);
      const endTime = `${hourPart2.length==1 ? hourPart2+'0' : hourPart2}:00`;

      await db.run(
        `INSERT INTO ${SCHEDULE.TABLE_NAME} (${SCHEDULE.START_TIME}, ${SCHEDULE.END_TIME}, ${SCHEDULE.DAY_OF_WEEK}, ${SCHEDULE.CLASS_ID}) VALUES (?, ?, ?, ?)`,
        [startTime, endTime, day, classId]
      );
    }
    console.log('Schedule inserted');    // 5. Trainers
    console.log(`\n Inserting trainers...`);
    let trainer_columns = [TRAINERS.NAME, TRAINERS.SPECIALITY, TRAINERS.CERTIFICATE, TRAINERS.YEARS_OF_EXPERIENCE, TRAINERS.IMAGE];
    await seedTableWithImages(TRAINERS.TABLE_NAME, trainer_columns, 10);

    console.log('Trainers inserted');
    // 6. Gallery Categories (UNIQUE name constraint)
    console.log(`\n Inserting gallery categories...`);
    const categoryIds = [];
    for (const cat of fake_data.gallery_category) {
      const result = await db.run(
        `INSERT INTO ${GALLERY_CATEGORY.TABLE_NAME} (${GALLERY_CATEGORY.NAME}) VALUES (?)`,
        [cat.name]
      );
      categoryIds.push(result.lastID);
    }
    console.log('Gallery categories inserted');    // 7. Gallery Images (UNIQUE filename constraint)
    console.log(`\n Inserting 10 gallery images...`);
    const catId = categoryIds[0];
    const number_of_images = 15;
    const copiedImages = await copyTestImages('gallery', number_of_images);

     // keep as much gallery images as  images we have copied successfully
    for (let i = 0; i < copiedImages.length; i++) {

      let image = copiedImages[i];

      await db.run(
        `INSERT INTO ${GALLERY_IMAGE.TABLE_NAME} (${GALLERY_IMAGE.NAME}, ${GALLERY_IMAGE.DESCRIPTION}, ${GALLERY_IMAGE.FILENAME}, ${GALLERY_IMAGE.CATEGORY_ID}) VALUES (?, ?, ?, ?)`,
        [`Image ${i + 1}`, `Gallery image ${i + 1}`, image, catId]
      );
    }      
    console.log('Gallery images inserted');

    // 8. Reviews
    console.log('\n Inserting  reviews...');
    const review_columns = [REVIEWS.AUTHOR, REVIEWS.CONTENT, REVIEWS.IMAGE, REVIEWS.IDENTITY];
    await seedTableWithImages(REVIEWS.TABLE_NAME, review_columns, 10);

    console.log('Reviews inserted');    // 9. Events
    console.log('\n Inserting events...');
    const event_columns = [EVENTS.TITLE, EVENTS.DESCRIPTION, EVENTS.DATE, EVENTS.LOCATION, EVENTS.IMAGE];
    await seedTableWithImages(EVENTS.TABLE_NAME, event_columns, 70, true, 'events');

    console.log('Events inserted');    // 10. Transformations
    console.log('Inserting transformations...');

    const fake_data_length = fake_data.transformations.length;
    for (let i = 0; i < fake_data_length*10; i++) {
      const trans = fake_data.transformations[i % fake_data_length];
      const copiedTransformationImages = await copyTestImages('transformations', 2);
      
      if (copiedTransformationImages.length < 2) {
        console.warn('Warning: Not enough images copied for transformations. Skipping insertion.');
        continue;
      }
      
      await db.run(
        `INSERT INTO ${TRANSFORMATIONS.TABLE_NAME} (${TRANSFORMATIONS.NAME}, ${TRANSFORMATIONS.DESCRIPTION}, ${TRANSFORMATIONS.BEFORE_IMAGE}, ${TRANSFORMATIONS.AFTER_IMAGE}) VALUES (?, ?, ?, ?)`,
        [`${trans[TRANSFORMATIONS.NAME]} ${i + 1}`, trans[TRANSFORMATIONS.DESCRIPTION], copiedTransformationImages[0], copiedTransformationImages[1]]
      );
    }
    console.log('Transformations inserted');    // 11. Social Media Links
    console.log(`\n Inserting ${fake_data[SOCIAL_MEDIA_LINKS.TABLE_NAME].length} social media links...`);

    const social_media_link_columns = [SOCIAL_MEDIA_LINKS.PLATFORM, SOCIAL_MEDIA_LINKS.LINK];
    await seedTableWithImages(SOCIAL_MEDIA_LINKS.TABLE_NAME, social_media_link_columns, 0, false);

    console.log('Social media links inserted');    // 12. Business Hours
    console.log(`\n Inserting ${fake_data[BUSINESS_HOURS.TABLE_NAME].length} business hours...`);
    for (const hour of fake_data[BUSINESS_HOURS.TABLE_NAME]) {
      await db.run(
        `INSERT INTO ${BUSINESS_HOURS.TABLE_NAME} (${BUSINESS_HOURS.DAY}, ${BUSINESS_HOURS.OPEN_TIME}, ${BUSINESS_HOURS.CLOSE_TIME}) VALUES (?, ?, ?)`,
        [hour[BUSINESS_HOURS.DAY], hour[BUSINESS_HOURS.OPEN_TIME], hour[BUSINESS_HOURS.CLOSE_TIME]]
      );
    }
    console.log('Business hours inserted');

    console.log('\nDatabase seeding completed successfully!\n');

    // update storage state after seeding
    await createNewStateFile();
    console.log('Storage state initialized after seeding.');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

await seedDatabase();