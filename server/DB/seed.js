import db from './db_connection.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceImgDir = path.join(__dirname, '../__tests__/fixtures');
const uploadDir = path.join(__dirname, '../uploads');
const fakeDataPath = path.join(__dirname, '../__tests__/fixtures/fake_data.json');

let fakeData = {};

async function loadFakeData() {
  try {
    const rawData = await fs.readFile(fakeDataPath, 'utf8');
    fakeData = JSON.parse(rawData);
  } catch (error) {
    console.error('Error loading fake data:', error.message);
    process.exit(1);
  }
}

async function copyTestImages() {
  try {
    // prepare source and destination paths
    const image = 'testing_image.jpg';
    const sourcePath = path.join(sourceImgDir, image);
    
    const folders = ['gallery', 'trainers', 'reviews', 'classes', 'events', 'transformations'];
    
    for (const folder of folders) {
      const destDir = path.join(uploadDir, folder);
      await fs.mkdir(destDir, { recursive: true });
      
      const destPath = path.join(destDir, image);
      await fs.copyFile(sourcePath, destPath).catch(err => {
        if (err.code !== 'ENOENT') console.warn(`Warning: Could not copy to ${folder}`);
      });
    }
    
    console.log('Test images copied to all folders');
  } catch (error) {
    console.error('Error copying images:', error);
  }
}

async function seedDatabase() {
  try {
    console.log('Starting database seeding...\n');

    await copyTestImages();
    const image = 'testing_image.jpg';

    // 1. Classes
    console.log(`Inserting ${fakeData.classes.length} classes...`);
    const classIds = [];
      for (const cls of fakeData.classes) {
        const result = await db.run(
          `INSERT INTO classes (name, description, private_coaching, image) VALUES (?, ?, ?, ?)`,
          [`${cls.name}`, cls.description, cls.private_coaching, image]
        );
         classIds.push(result.lastID);
      }
    console.log('Classes inserted');

    // 2. Pricing Plans
    console.log(`Inserting ${fakeData.pricing_plans.length} pricing plans...`);
    const planIds = [];
    for (const plan of fakeData.pricing_plans) {
      const result = await db.run(
        `INSERT INTO pricing_plans (name, price, period, description) VALUES (?, ?, ?, ?)`,
        [plan.name, plan.price, plan.period, plan.description]
      );
      planIds.push(result.lastID);
    }
    console.log('Pricing plans inserted');

    // 3. Pricing Features (linked to plans)
    console.log(`Inserting pricing features...`);
    for (const planId of planIds) {
      for (const feature of fakeData.pricing_features) {
        await db.run(
          `INSERT INTO pricing_features (plan_id, feature) VALUES (?, ?)`,
          [planId, feature.feature]
        );
      }
    }
    console.log('Pricing features inserted');

    // 4. Schedule (linked to classes)
    console.log('Inserting schedule entries...');
    const days_of_week = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const times = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];

    for (let i = 0; i < 10; i++) {
      // calculate random schedule entries
      // get class id in round robin fashion
      const classId = classIds[i % classIds.length];
      // pick random day and time
      const day = days_of_week[Math.floor(Math.random() * days_of_week.length)];
      // pick random start time
      const startHour = parseInt(times[Math.floor(Math.random() * times.length)]);
      // calculate end time (1 hour later)
      const startTime = `${startHour.toString().padStart(2, '0')}:00`;
      // wrap around if over 23
      const endTime = `${((startHour + 1) % 24).toString().padStart(2, '0')}:00`;
      
      await db.run(
        `INSERT INTO schedule (start_time, end_time, day_of_week, class_id) VALUES (?, ?, ?, ?)`,
        [startTime, endTime, day, classId]
      );
    }
    console.log('Schedule inserted');

    // 5. Trainers
    console.log(`Inserting ${fakeData.trainers.length * 10} trainers...`);
    const trainerIds = [];
    for (let i = 0; i < 10; i++) {
      for (const trainer of fakeData.trainers) {
        const result = await db.run(
          `INSERT INTO trainers (name, speciality, certificate, years_of_experience, image) VALUES (?, ?, ?, ?, ?)`,
          [`${trainer.name} ${i + 1}`, trainer.speciality, trainer.certificate, trainer.years_of_experience, image]
        );
        if (i === 0) trainerIds.push(result.lastID);
      }
    }
    console.log('Trainers inserted');


    // 6. Gallery Categories (UNIQUE name constraint)
    console.log(`Inserting ${fakeData.gallery_categories.length} gallery categories...`);
    const categoryIds = [];
    for (const cat of fakeData.gallery_categories) {
      const result = await db.run(
        `INSERT INTO gallery_category (name) VALUES (?)`,
        [cat.name]
      );
      categoryIds.push(result.lastID);
    }
    console.log('Gallery categories inserted');

    // 7. Gallery Images (UNIQUE filename constraint)
    console.log('Inserting 10 gallery images...');
    for (let i = 0; i < 10; i++) {
      const catId = categoryIds[i % categoryIds.length];
      const uniqueFilename = `gallery_${i + 1}_${image}`;
      await db.run(
        `INSERT INTO gallery_image (name, description, filename, category_id) VALUES (?, ?, ?, ?)`,
        [`Image ${i + 1}`, `Gallery image ${i + 1}`, uniqueFilename, catId]
      );
    }
    console.log('Gallery images inserted');


    // 8. Reviews
    console.log('Inserting 10 reviews...');
    for (let i = 0; i < 10; i++) {
      const review = fakeData.reviews[i % fakeData.reviews.length];
      await db.run(
        `INSERT INTO reviews (author, content, image, identity) VALUES (?, ?, ?, ?)`,
        [`${review.author} ${i + 1}`, review.content, image, review.identity]
      );
    }
    console.log('Reviews inserted');

    // 9. Events
    console.log('Inserting 10 events...');
    for (let i = 0; i < 10; i++) {
      const event = fakeData.events[i % fakeData.events.length];
      const futureDate = Math.floor(Date.now() / 1000) + (86400 * (i % 365));
      
      await db.run(
        `INSERT INTO event (title, description, date, location, image) VALUES (?, ?, ?, ?, ?)`,
        [`${event.title} ${i + 1}`, event.description, futureDate, event.location, image]
      );
    }
    console.log('Events inserted');

    // 10. Transformations
    console.log('Inserting 10 transformations...');
    for (let i = 0; i < 10; i++) {
      const trans = fakeData.transformations[i % fakeData.transformations.length];
      await db.run(
        `INSERT INTO transformations (name, description, before_image, after_image) VALUES (?, ?, ?, ?)`,
        [`${trans.name} ${i + 1}`, trans.description, image, image]
      );
    }
    console.log('Transformations inserted');

    // 11. Social Media Links
    console.log(`Inserting ${fakeData.social_media.length} social media links...`);
    for (const link of fakeData.social_media) {
      await db.run(
        `INSERT INTO social_media_link (platform, link) VALUES (?, ?)`,
        [link.platform, link.link]
      );
    }
    console.log('Social media links inserted');

    // 12. Business Hours
    console.log(`Inserting ${fakeData.business_hours.length} business hours...`);
    for (const hour of fakeData.business_hours) {
      await db.run(
        `INSERT INTO business_hour (day, open_time, close_time) VALUES (?, ?, ?)`,
        [hour.day, hour.open_time, hour.close_time]
      );
    }
    console.log('Business hours inserted');

    console.log('\nDatabase seeding completed successfully!\n');
    console.log('Seeded data summary:');
    console.log(`   Classes: ${fakeData.classes.length}`);
    console.log(`   Schedule entries: 100`);
    console.log(`   Trainers: ${fakeData.trainers.length * 10}`);
    console.log(`   Gallery categories: ${fakeData.gallery_categories.length}`);
    console.log(`   Gallery images: 10`);
    console.log(`   Reviews: 10`);
    console.log(`   Events: 10`);
    console.log(`   Transformations: 10`);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

await loadFakeData();
await seedDatabase();