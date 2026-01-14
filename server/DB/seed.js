import db from './db_connection.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceImgDir = path.join(__dirname, '../public/img');
const uploadDir = path.join(__dirname, '../uploads/general_info');

// Helper function to copy images to uploads directory
async function setupImages() {
    try {
        // Create uploads directory if it doesn't exist
        await fs.mkdir(uploadDir, { recursive: true });
        console.log('✓ Upload directory ready:', uploadDir);

        // Copy images from public/img to uploads
        const images = ['hero_image.jpg', 'about_image.webp', 'test.webp'];
        
        for (const image of images) {
            const sourcePath = path.join(sourceImgDir, image);
            const destPath = path.join(uploadDir, image);
            
            try {
                await fs.copyFile(sourcePath, destPath);
                console.log(`✓ Copied: ${image}`);
            } catch (error) {
                if (error.code !== 'ENOENT') {
                    console.warn(`⚠ Could not copy ${image}:`, error.message);
                }
            }
        }
    } catch (error) {
        console.error('❌ Error setting up images:', error);
    }
}

// Bulk insert script for testing
async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');
        
        // Setup images first
        await setupImages();
        console.log('');// 1. Classes
        await db.run(
            `INSERT INTO classes (name, description, private_coaching, popular, image) VALUES (?, ?, ?, ?, ?)`,
            ['Yoga', 'Relaxing yoga classes for all levels', false, true, 'hero_image.jpg']
        );
        await db.run(
            `INSERT INTO classes (name, description, private_coaching, popular, image) VALUES (?, ?, ?, ?, ?)`,
            ['Weight Training', 'Build muscle with expert guidance', true, true, 'about_image.webp']        );
        console.log('✓ Classes inserted');

        // 2. Pricing Plans
        await db.run(
            `INSERT INTO pricing_plans (name, price, period, description) VALUES (?, ?, ?, ?)`,
            ['Basic', 29.99, 'month', 'Access to basic classes']
        );
        await db.run(
            `INSERT INTO pricing_plans (name, price, period, description) VALUES (?, ?, ?, ?)`,
            ['Premium', 59.99, 'month', 'Access to all classes and personal training']        );
        console.log('✓ Pricing plans inserted');

        // 3. Pricing Features
        await db.run(
            `INSERT INTO pricing_features (plan_id, feature) VALUES (?, ?)`,
            [1, 'Unlimited classes']
        );
        await db.run(
            `INSERT INTO pricing_features (plan_id, feature) VALUES (?, ?)`,
            [2, 'Personal trainer']        );
        console.log('✓ Pricing features inserted');

        // 4. Schedule
        await db.run(
            `INSERT INTO schedule (start_time, end_time, day_of_week, class_id) VALUES (?, ?, ?, ?)`,
            ['09:00', '10:00', 'Monday', 1]
        );
        await db.run(
            `INSERT INTO schedule (start_time, end_time, day_of_week, class_id) VALUES (?, ?, ?, ?)`,
            ['18:00', '19:30', 'Wednesday', 2]        );
        console.log('✓ Schedule inserted');

        // 5. Trainers
        await db.run(
            `INSERT INTO trainers (name, speciality, certificate, years_of_experience, image) VALUES (?, ?, ?, ?, ?)`,
            ['John Doe', 'Weight Training', 'NASM', 5, 'hero_image.jpg']
        );
        await db.run(
            `INSERT INTO trainers (name, speciality, certificate, years_of_experience, image) VALUES (?, ?, ?, ?, ?)`,
            ['Jane Smith', 'Yoga', 'RYT-200', 8, 'about_image.webp']        );
        console.log('✓ Trainers inserted');

        // 6. Gallery Categories
        await db.run(
            `INSERT INTO gallery_category (name) VALUES (?)`,
            ['Before & After']
        );
        await db.run(
            `INSERT INTO gallery_category (name) VALUES (?)`,
            ['Facility']        );
        console.log('✓ Gallery categories inserted');

        // 7. Gallery Images
        await db.run(
            `INSERT INTO gallery_image (name, description, filename, category_id) VALUES (?, ?, ?, ?)`,
            ['Transformation 1', 'Amazing results', 'hero_image.jpg', 1]
        );
        await db.run(
            `INSERT INTO gallery_image (name, description, filename, category_id) VALUES (?, ?, ?, ?)`,
            ['Gym Floor', 'State-of-the-art equipment', 'about_image.webp', 2]        );
        console.log('✓ Gallery images inserted');

        // 8. Reviews
        await db.run(
            `INSERT INTO reviews (author, content, image, identity) VALUES (?, ?, ?, ?)`,
            ['Client A', 'Great experience! Highly recommend.', 'hero_image.jpg', 'Member']
        );
        await db.run(
            `INSERT INTO reviews (author, content, image, identity) VALUES (?, ?, ?, ?)`,
            ['Client B', 'Best trainers in town!', 'about_image.webp', 'Premium Member']        );
        console.log('✓ Reviews inserted');

        // 9. Events
        await db.run(
            `INSERT INTO event (title, description, date, location, image) VALUES (?, ?, ?, ?, ?)`,
            ['Summer Bootcamp', 'Intensive training program', Math.floor(Date.now() / 1000) + 86400 * 30, 'Main Studio', 'hero_image.jpg']
        );
        await db.run(
            `INSERT INTO event (title, description, date, location, image) VALUES (?, ?, ?, ?, ?)`,
            ['Yoga Retreat', 'Weekend yoga and meditation', Math.floor(Date.now() / 1000) + 86400 * 60, 'Outdoor', 'about_image.webp']        );
        console.log('✓ Events inserted');

        // 10. Transformations
        await db.run(
            `INSERT INTO transformations (name, description, before_image, after_image) VALUES (?, ?, ?, ?)`,
            ['Client Success 1', '3-month transformation', 'test.webp', 'hero_image.jpg']
        );
        await db.run(
            `INSERT INTO transformations (name, description, before_image, after_image) VALUES (?, ?, ?, ?)`,
            ['Client Success 2', '6-month journey', 'test.webp', 'about_image.webp']        );
        console.log('✓ Transformations inserted');

        // 11. Social Media Links
        await db.run(
            `INSERT INTO social_media_link (platform, link) VALUES (?, ?)`,
            ['Instagram', 'https://instagram.com/yourpage']
        );
        await db.run(
            `INSERT INTO social_media_link (platform, link) VALUES (?, ?)`,
            ['Facebook', 'https://facebook.com/yourpage']        );
        console.log('✓ Social media links inserted');

        // 12. Business Hours
        await db.run(
            `INSERT INTO business_hour (day, open_time, close_time) VALUES (?, ?, ?)`,
            ['Monday', '06:00', '22:00']
        );
        await db.run(
            `INSERT INTO business_hour (day, open_time, close_time) VALUES (?, ?, ?)`,
            ['Sunday', '08:00', '20:00']        );
        console.log('✓ Business hours inserted');

        console.log('\n✅ Database seeding completed successfully!');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        await db.close();
    }
}

// Run the seed function
seedDatabase();