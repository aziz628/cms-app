import request  from "supertest";
import app from "../../app.js";
import { getAuthCookies } from '../helper/tools.js';

describe("General Info API", () => {

    // prepare cookies for authentication
    let authCookies;    
    let hours_id;

    beforeAll(async () => {
        authCookies = await getAuthCookies();
    });

   
    describe("POST /api/admin/general-info/business-hours", () => {
        // happy path - add business hours
        it('should add business hours', async () => {
            // Arrange: Prepare the new business hours data
            const newBusinessHour = {
                day: 'sunday',
                open_time: '08:00',
                close_time: '16:00'
            };
            const response = await request(app)
                .post('/api/admin/general-info/business-hours')
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .send(newBusinessHour);

            // Assert: Check if the application correctly handled the addition
            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe("Business hour created successfully");
            expect(response.body.id).toBeDefined();
            // Save the created business hours ID for later use
            hours_id = response.body.id;
        });
        // sad path - missing fields
        it('should return 400 for missing fields', async () => {
            // Arrange: Prepare an incomplete business hour data
            const incompleteBusinessHour = {
                day: 'sunday',
                open_time: '08:00'
                // close_time is missing
            };
            const response = await request(app)
                .post('/api/admin/general-info/business-hours')
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .send(incompleteBusinessHour);

            // Assert: Check if the application correctly handled the missing fields
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toMatch(/"close_time" is required/);
            expect(response.body.code).toBe('VALIDATION_ERROR');
        });
    });

    describe("PUT /api/admin/general-info", () => {

        // happy path - update general information
        it('should update general information', async () => {
            // Arrange: update the general information about_summary
            const updatedGeneralInfo = {
                about_summary: 'Updated about summary',
            };

            // Act: Make a PUT request to the/api/admin/general-info/about-summary endpoint
            const response = await request(app)
                .put('/api/admin/general-info/about-summary')
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .send(updatedGeneralInfo);

            // Assert: Check if the application correctly handled the update
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("About summary updated successfully");
        })
        // sad path - missing fields 
        it('should return 400 for missing fields', async () => {
            // Arrange: Prepare an update request with missing fields
            const incompleteUpdate = {
                // about_summary is missing
            };

            // Act: Make a PUT request to the /api/admin/general-info/about-summary endpoint
            const response = await request(app)
                .put('/api/admin/general-info/about-summary')
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .send(incompleteUpdate);

            // Assert: Check if the application correctly handled the missing fields
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toMatch(/"about_summary" is required/);
            expect(response.body.code).toBe('VALIDATION_ERROR');

        });

        // happy path - update business hours
        it('should update business hours', async () => {
            // Arrange: Prepare the updated business hours
            const updatedBusinessHours = {
                "day":"monday-friday",
                "open_time":"10:00",
                "close_time":"22:00"
            };

            // Act: Make a PUT request to the /api/admin/general-info/business-hours endpoint
            const response = await request(app)
                .put('/api/admin/general-info/business-hours/' + hours_id)
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .send(updatedBusinessHours);

                // Assert: Check if the application correctly handled the update
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("Business hour updated successfully");
        });
        
        // sad path - invalid business hours format
        it('should return 400 for invalid business hours format', async () => {
            // arrange : prepare an invalid business hours format
            const invalidBusinessHours =  {
                    "day": "monday",
                    "open_time": "invalid_time", // Invalid time format
                    "close_time": "22:00"
                }
            // Act: Make a PUT request to the /api/admin/general-info/business-hours endpoint
            const response = await request(app)
                .put('/api/admin/general-info/business-hours/' + hours_id)
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .send(invalidBusinessHours);

            // Assert: Check if the application correctly handled the invalid format
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toMatch(/"open_time" must be in HH:MM format/);
            expect(response.body.code).toBe('VALIDATION_ERROR');
        })
        // sad path - invalid business hours id
        it('should return 404 for invalid business hours id', async () => {
            // arrange : prepare an invalid business hours id
            const invalidHoursId = 999999; // Assuming this ID does not exist
            const updatedBusinessHours = {
                "day":"monday-friday",
                "open_time":"10:00",
                "close_time":"22:00"
            };

            // Act: Make a PUT request to the /api/admin/general-info/business-hours/:id endpoint
            const response = await request(app)
                .put('/api/admin/general-info/business-hours/' + invalidHoursId)
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .send(updatedBusinessHours);

            // Assert: Check if the application correctly handled the invalid ID
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe("No business hour found with ID " + invalidHoursId);
            expect(response.body.code).toBe('BUSINESS_HOUR_NOT_FOUND');
        })
    })
     describe("GET /api/admin/general-info", () => {
        // happy path - get general information
        it('should return general information', async () => {
            // Act: Make a GET request to the /api/general-info endpoint
            const response = await request(app)
                .get('/api/admin/general-info')
                .set('Cookie', authCookies); // Use the auth cookies for authentication

                
            expect(response.statusCode).toBe(200);
            expect(response.body).toBeDefined();
            expect(response.body.about_summary).toBeDefined();
            expect(Array.isArray(response.body.business_hours)).toBe(true);
            // Check that each business hour has the required properties
            for (const hour of response.body.business_hours) {
                expect(hour).toHaveProperty('day');
                expect(hour).toHaveProperty('open_time');
                expect(hour).toHaveProperty('close_time');
            }
        });

        // sad path - unauthorized access
        it('should return 401 for unauthorized access', async () => {
            // Act: Make a GET request to the /api/general-info endpoint without authentication
            const response = await request(app)
                .get('/api/admin/general-info');

            // Assert: Check if the application correctly handled the unauthorized access
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
            expect(response.body.code).toBe('UNAUTHORIZED');
        });
    });

    describe("DELETE /api/admin/general-info/business-hours/:id", () => {
        // happy path - delete business hours
        it('should delete business hours', async () => {
            // Act: Make a DELETE request to the /api/admin/general-info/business-hours/:id endpoint
            const response = await request(app)
                .delete('/api/admin/general-info/business-hours/' + hours_id)
                .set('Cookie', authCookies); // Use the auth cookies for authentication

            // Assert: Check if the application correctly handled the deletion
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("Business hour deleted successfully");
        });

        // sad path - invalid business hours id
        it('should return 404 for invalid business hours id', async () => {
            // arrange : prepare an invalid business hours id
            const invalidHoursId = 999999; // Assuming this ID does not exist

            // Act: Make a DELETE request to the /api/admin/general-info/business-hours/:id endpoint
            const response = await request(app)
                .delete('/api/admin/general-info/business-hours/' + invalidHoursId)
                .set('Cookie', authCookies); // Use the auth cookies for authentication

            // Assert: Check if the application correctly handled the invalid ID

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe("No business hour found with ID " + invalidHoursId);
            expect(response.body.code).toBe('BUSINESS_HOUR_NOT_FOUND');
        });
    });
})
