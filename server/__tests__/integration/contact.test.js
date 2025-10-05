import request from 'supertest';
import app from '../../app'; // Adjust the path to your Express app
import { getAuthCookies } from '../helper/tools.js';

const SUPPORTED_PLATFORMS = [
  'facebook',
  'instagram',
  'twitter',
  'youtube',
  'linkedin',
  'tiktok',
  'pinterest',
  'snapchat'
];


describe('Contact Integration Tests', () => {
    let authCookies;
    let social_media_link_id;
     beforeAll(async () => {
        authCookies = await getAuthCookies();
     });
   
    describe('POST /api/admin/contact', () => {
        // happy path - create a new social media link
        it("should create a new social media link", async () => {
            // Arrange: Prepare the data to create a new social media link
            const newLink = { platform: 'twitter', link: 'https://twitter.com/example' };

            // Act: Send a POST request to create a new social media link
            const response = await request(app)
                .post('/api/admin/contact/social-media')
                .set('Cookie', authCookies)
                .send(newLink);

            // Assert: Check if the creation was successful
            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe('Social media link created successfully');
            expect(response.body).toHaveProperty('id');

            // Store the created social media link ID for later use
            social_media_link_id = response.body.id;
        })

        // sad path - try to create a social media link with invalid platform
        it("should return 400 for invalid social media platform", async () => {
            // Arrange: Prepare invalid social media link data
            const newLink = { platform: 'invalid_platform', link: 'https://example.com' };
            // Act: Send a POST request with invalid data
            const response = await request(app)
                .post('/api/admin/contact/social-media')
                .set('Cookie', authCookies)
                .send(newLink);
            // Assert: Check if the response is a validation error
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe(`"platform" must be one of [${SUPPORTED_PLATFORMS.join(', ')}]`);
            expect(response.body.code).toBe('VALIDATION_ERROR');
        })
    });
    describe('PUT /api/admin/contact', () => {

        //happy path - update social media link
        it('should update social media link', async () => {
            // Arrange: Prepare the data to update social media link
            const social_media_link = { platform: 'facebook', link: 'https://facebook.com/example' };
            // Act: Send a PUT request to update social media link
            
            const response = await request(app)
                .put(`/api/admin/contact/social-media/${social_media_link_id}`)
                .set('Cookie', authCookies)
                .send(social_media_link);

            // Assert: Check if the update was successful
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Social media updated successfully');
        });
        // sad path - invalid social media link id
        it('should return 404 for invalid social media link id', async () => {
            // Arrange: Prepare the data to update social media link
            const social_media_link = { platform: 'facebook', link: 'https://facebook.com/example' };
            const invalid_id = 99999999;
            // Act: Send a PUT request with invalid id
            const response = await request(app)
                .put(`/api/admin/contact/social-media/${invalid_id}`)
                .set('Cookie', authCookies)
                .send(social_media_link);
            // Assert: Check if the response indicates not found
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe(`No social media link found with ID ${invalid_id}`);
            expect(response.body.code).toBe('LINK_NOT_FOUND');

        })

        // sad path - invalid social media platform
        it('should return 400 for invalid social media platform', async () => {
            // Arrange: Prepare invalid social media links
            const social_media_link ={ platform: 'invalid_platform', link: 'https://example.com' }
            
            // Act: Send a PUT request with invalid data
            const response = await request(app)
                .put(`/api/admin/contact/social-media/${social_media_link_id}`)
                .set('Cookie', authCookies)
                .send(social_media_link);

            // Assert: Check if the response is a validation error
            expect(response.statusCode).toBe(400);
            // platform must be one of the supported platforms
            expect(response.body.message).toBe(`"platform" must be one of [${SUPPORTED_PLATFORMS.join(', ')}]`);
            expect(response.body.code).toBe('VALIDATION_ERROR');
        });
        // sad path - empty social media link
        it('should return 400 for empty social media link', async () => {
            // Act: Send a PUT request with invalid data
            const response = await request(app)
                .put(`/api/admin/contact/social-media/${social_media_link_id}`)
                .set('Cookie', authCookies)

            // Assert: Check if the response is a validation error
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('At least one field must be provided for update');
            expect(response.body.code).toBe('VALIDATION_ERROR');
        })

        // happy path - update adress   
        it('should update address', async () => {
            // Arrange: Prepare the data to update address
            const address = '123 Main St, City, Country';
            // Act: Send a PUT request to update address
            const response = await request(app)
                .put('/api/admin/contact/address')
                .set('Cookie', authCookies)
                .send({ address });

            // Assert: Check if the update was successful
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Address updated successfully');
        });
        // sad path - invalid address
        it('should return 400 for invalid address', async () => {
            // Arrange: Prepare invalid address
            const address = '123'; // Too short
            // Act: Send a PUT request with invalid data
            const response = await request(app)
                .put('/api/admin/contact/address')    
                .set('Cookie', authCookies)
                .send({ address });

            // Assert: Check if the response is a validation error
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('"address" must be at least 5 chars');
            expect(response.body.code).toBe('VALIDATION_ERROR');
        })
        // happy path - update phone number
        it('should update phone number', async () => {
            // Arrange: Prepare the data to update phone number
            const phone_number = 12345678; // Example 8-digit phone number
            // Act: Send a PUT request to update phone number
            const response = await request(app)
                .put('/api/admin/contact/phone_number')
                .set('Cookie', authCookies)
                .send({ phone_number });

            // Assert: Check if the update was successful
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Phone number updated successfully');
        })
        // sad path - invalid phone number
        it('should return 400 for invalid phone number', async () => {
            // Arrange: Prepare invalid phone number
            const phone_number = 12345; // Too short
            // Act: Send a PUT request with invalid data
            const response = await request(app)
                .put('/api/admin/contact/phone_number')
                .set('Cookie', authCookies)
                .send({ phone_number });

            // Assert: Check if the response is a validation error
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('"phone_number" must be ≥ 10000000');
            expect(response.body.code).toBe('VALIDATION_ERROR');
        })
        // happy path - update email
        it('should update email', async () => {
            // Arrange: Prepare the data to update email
            const email = 'test@example.com';
            // Act: Send a PUT request to update email
            const response = await request(app)
                .put('/api/admin/contact/email')
                .set('Cookie', authCookies)
                .send({ email });

            // Assert: Check if the update was successful
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Email updated successfully');
        })
        // sad path - invalid email
        it('should return 400 for invalid email', async () => {
            // Arrange: Prepare invalid email
            const email = 'invalid-email'; // Invalid email format
            // Act: Send a PUT request with invalid data
            const response = await request(app)
                .put('/api/admin/contact/email')
                .set('Cookie', authCookies)
                .send({ email });

            // Assert: Check if the response is a validation error
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('"email" must be a valid email');
            expect(response.body.code).toBe('VALIDATION_ERROR');
        })
    })
     describe('GET /api/admin/contact', () => {

        // happy path - get all contact messages
        it('should return all contact messages', async () => {
            // Act: Send a GET request to fetch all contact messages
            const response = await request(app)
                .get('/api/admin/contact')
                .set('Cookie', authCookies);

            // Assert: Check if the response is successful
            expect(response.statusCode).toBe(200);
            expect(response.body).toBeDefined();
           
            expect(response.body).toHaveProperty("contact_info");
            expect(response.body.contact_info).toHaveProperty('address');
            expect(response.body.contact_info).toHaveProperty('phone_number');
            expect(response.body.contact_info).toHaveProperty('email');
            expect(response.body).toHaveProperty('social_media_links');

            // check nested properties
            for (const link of response.body.social_media_links) {
                expect(link).toHaveProperty('platform');
                expect(link).toHaveProperty('link');
            }
        });
    })
    describe('DELETE /api/admin/contact', () => {
        //happy path - delete a social media link
        it('should delete a social media link', async () => {
            // Act: Send a DELETE request to delete the social media link
            const response = await request(app)
                .delete(`/api/admin/contact/social-media/${social_media_link_id}`)
                .set('Cookie', authCookies);
            // Assert: Check if the deletion was successful
            expect(response.statusCode).toBe(204);
        })

        // sad path - try to delete a non-existing social media link
        it('should return 404 for non-existing social media link', async () => {
            // Arrange: Use an invalid social media link ID
            const invalid_id = 99999999;
            // Act: Send a DELETE request with an invalid ID
            const response = await request(app)
                .delete(`/api/admin/contact/social-media/${invalid_id}`)
                .set('Cookie', authCookies);
            // Assert: Check if the response indicates not found
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe(`No social media link found with ID ${invalid_id}`);
            expect(response.body.code).toBe('LINK_NOT_FOUND');
        })
    })
})