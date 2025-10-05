import request from 'supertest';
import app from '../../app'; // Adjust the path to your Express app
import path from 'path';
import fs from 'fs'
import review_service from '../../services/review_service.js'; // Adjust the path to your gallery service
import { getAuthCookies,get_fixture_image,ensure_uploaded_file_exist ,invalid_fixture_image,check_no_file_in_uploads} from '../helper/tools.js';
// global variables
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
const identityTypes = ['member', 'guest',""];

upload_subfolder="reviews"
// main describe block for Review API integration tests
describe('Review API Integration Tests', () => {
    let authCookies;
    let reviewId;
    let review_image_name;

    beforeAll(async () => {
        authCookies = await getAuthCookies();
    });
    // cleanup after all tests
    afterAll(async () => {
        const noFilesExist = check_no_file_in_uploads(upload_subfolder);
        expect(noFilesExist).toBe(true);
    });

    describe('POST /api/reviews', () => {

        // happy path - add a review
        it('should add a review', async () => {
            const newReview = {
                author: 'Test Author',
                content: 'This is a test review content.',
                // optional identity
                identity: 'member' 
            };

            // Act: Send a POST request to add a new review
            const response = await request(app)
                .post('/api/admin/review')
                .set('Cookie', authCookies)
                .field('author', newReview.author)
                .field('content', newReview.content)
                .field('identity', newReview.identity)
                .attach('image', get_fixture_image());

            // Assert: Check if the review was added successfully

            expect(response.body.id).toBeDefined(); // check if ID is returned
            // Store the review ID for cleanup later
            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe('Review added successfully');
            expect(response.body.image).toBeDefined();

            // check the image existence 
            const image_exists = ensure_uploaded_file_exist(upload_subfolder, response.body.image);
            expect(image_exists).toBe(true);

            // Store the review ID and image name for later use
            reviewId = response.body.id;
            review_image_name = response.body.image;
        });
        // sad path - add a review without required fields
        it('should return 400 for missing required fields', async () => {
            // arrange: Prepare the review data without required fields
            const incompleteReview = {
                author: 'incomplete review',
            };
            const response = await request(app)
                .post('/api/admin/review')
                .set('Cookie', authCookies)
                .field('author', incompleteReview.author)
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('"content" is required');
            expect(response.body.code).toBe('VALIDATION_ERROR');
        })
        // sad path - add a review with invalid identity
        it('should return 400 for invalid identity', async () => {
            const invalidReview = {
                author: 'Invalid author ',
                content: 'This review has an invalid identity.',
                identity: 'invalid_identity'
            };

            const response = await request(app)
                .post('/api/admin/review')
                .set('Cookie', authCookies)
                .field('author', invalidReview.author)
                .field('content', invalidReview.content)
                .field('identity', invalidReview.identity);

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe(`"identity" must be one of [${identityTypes.join(", ")}]`);
            expect(response.body.code).toBe('VALIDATION_ERROR');
        })
        // sad path - add a review without an image
        it('should return 400 for missing image file', async () => {
            const incompleteReview = {
                author: 'Incomplete Review',
                content: 'This review is missing an image.'
            };

            const response = await request(app)
                .post('/api/admin/review')
                .set('Cookie', authCookies)
                .field('author', incompleteReview.author)
                .field('content', incompleteReview.content);

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('Files required: image');
            expect(response.body.code).toBe('FILE_REQUIRED');
        })
        // sad path - add a review with an invalid image file
        it('should return 400 for invalid image file', async () => {
            // Arrange: Prepare the review data
            const invalidReview = {
                author: 'Invalid Author',
                content: 'This review has an invalid image file.'
            };

            const response = await request(app)
                .post('/api/admin/review')
                .set('Cookie', authCookies)
                .field('author', invalidReview.author)
                .field('content', invalidReview.content)
                .attach('image', invalid_fixture_image());

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe(`Invalid file type. Allowed: ${allowedMimeTypes.join(', ')}`);
            expect(response.body.code).toBe('INVALID_FILE_TYPE');
        })
    });

    describe('GET /api/reviews', () => {
        // happy path - get all reviews
        it('should return all reviews', async () => {
            const response = await request(app)
                .get('/api/admin/review')
                .set('Cookie', authCookies);

            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            // Check if each review has the expected properties
            for (const review of response.body) {
                expect(review).toHaveProperty('id');
                expect(review).toHaveProperty('author');
                expect(review).toHaveProperty('content');
                expect(review).toHaveProperty('image');
                expect(review).toHaveProperty('created_at');
            }
        })
    })
    describe('PUT /api/reviews/:id', () => {
        // Ensure the reviewId and review_image_name are defined before running the tests
        beforeAll(() => {
            expect(reviewId).toBeDefined();
            expect(review_image_name).toBeDefined();
        })

        // happy path - update a review
        it('should update a review', async () => {
            const updatedReview = {
                author: 'Updated Author',
                content: 'This is the updated content of the review.',
                identity: 'member'
            };

        // Act: Send a PUT request to update the review
            const response = await request(app)
                .put(`/api/admin/review/${reviewId}`)
                .set('Cookie', authCookies)
                .field('author', updatedReview.author)
                .field('content', updatedReview.content)
                .field('identity', updatedReview.identity)
                .attach('image', get_fixture_image(1));

        // Assert: Check if the review was updated successfully
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Review updated successfully');
        expect(response.body.image).toBeDefined();

        // check that the old image is deleted
        const old_image_exists = ensure_uploaded_file_exist(upload_subfolder, review_image_name);
        expect(old_image_exists).toBe(false);

        // Check if the uploaded image exists
        const image_exists = ensure_uploaded_file_exist(upload_subfolder, response.body.image);
        expect(image_exists).toBe(true);

        // Store the updated review image
        review_image_name = response.body.image;
        })
        // sad path - update a review with invalid identity
        it('should return 400 for invalid identity', async () => {
            const invalidUpdate = {
                author: 'Invalid Author',
                content: 'This review update has an invalid identity.',
                identity: 'invalid_identity'
            };

            const response = await request(app)
                .put(`/api/admin/review/${reviewId}`)
                .set('Cookie', authCookies)
                .field('author', invalidUpdate.author)
                .field('content', invalidUpdate.content)
                .field('identity', invalidUpdate.identity);

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe(`"identity" must be one of [${identityTypes.join(", ")}]`);
            expect(response.body.code).toBe('VALIDATION_ERROR');
        })
        // sad path - update a review with missing required fields
        it('should return 400 for missing required fields', async () => {
            const response = await request(app)
                .put(`/api/admin/review/${reviewId}`)
                .set('Cookie', authCookies);
                
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('At least one field or a file must be provided for an update.');
            expect(response.body.code).toBe('UPDATE_EMPTY');
        })
    })
    describe('DELETE /api/reviews/:id', () => {
        // Ensure the reviewId and review_image_name are defined before running the tests
        beforeAll(() => {

            expect(reviewId).toBeDefined();
            expect(review_image_name).toBeDefined();
        })

        // happy path - delete a review
        it('should delete a review', async () => {
            // Act: Send a DELETE request to delete the review
            const response = await request(app)
                .delete(`/api/admin/review/${reviewId}`)
                .set('Cookie', authCookies);
            // Assert: Check if the review was deleted successfully
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Review deleted successfully');

            // check that the image is deleted
            const image_exists = ensure_uploaded_file_exist(upload_subfolder, review_image_name);
            expect(image_exists).toBe(false);
        })
        // sad path - delete a non-existent review
        it('should return 404 for non-existent review', async () => {
            // Act: Attempt to delete a review with a non-existent ID
            const nonExistentReviewId = 99999999; // Assuming this ID does not exist in the database

            // Act: Send a DELETE request to delete the review
            const response = await request(app)
                .delete(`/api/admin/review/${nonExistentReviewId}`)
                .set('Cookie', authCookies);
            
            // Assert: Check if the application correctly handled the error
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe(`Review with ID ${nonExistentReviewId} not found`);
            expect(response.body.code).toBe('REVIEW_NOT_FOUND');
        })
    })
})