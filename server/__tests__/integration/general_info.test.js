import request  from "supertest";
import app from "../../app.js";
import { getAuthCookies,get_fixture_image,invalid_fixture_image,ensure_uploaded_file_exist } from '../helper/tools.js';

const DEFAULT_HERO_IMAGE=process.env.DEFAULT_HERO_IMAGE;
const DEFAULT_ABOUT_IMAGE=process.env.DEFAULT_ABOUT_IMAGE;
const subfolder="general_info";

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
        // sad path - invalid day 
        it('should return 400 for invalid day format', async () => {
            // Arrange: Prepare a business hour data with invalid day format
            const invalidDayBusinessHour = {
                day: 'Funday', // Invalid day
                open_time: '08:00',
                close_time: '16:00'
            };
            const response = await request(app)
                .post('/api/admin/general-info/business-hours')
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .send(invalidDayBusinessHour);
            
                // Assert: Check if the application correctly handled the invalid day format
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toMatch(/Invalid day format. Use day name \(e.g., 'monday'\) or range \(e.g., 'monday-friday'\)/);
            expect(response.body.code).toBe('VALIDATION_ERROR');
        });
        // sad path - close_time less than 30 minutes after open_time
        it('should return 400 for close_time less than 30 minutes after open_time', async () => {
            // Arrange: Prepare a business hour data with close_time less than 30 minutes after open_time
            const invalidTimeBusinessHour = {
                day: 'monday',
                open_time: '10:00',
                close_time: '10:20' // Less than 30 minutes after open_time
            };
            const response = await request(app)
                .post('/api/admin/general-info/business-hours')
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .send(invalidTimeBusinessHour);
            
            // Assert: Check if the application correctly handled the invalid time range
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toMatch(/close_time must be at least 30 minutes after open_time/);
            expect(response.body.code).toBe('VALIDATION_ERROR');
        });
    });

    describe("PUT /api/admin/general-info", () => {
        // update-only general-info

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
        });

        // happy path - update general with hero_title
        it('should update general information with hero_title', async () => {
            // Arrange: update the general information hero_title
            const updatedGeneralInfo = {
                hero_title: 'Updated Hero Title',
            };

            // Act: Make a PUT request to the /api/admin/general-info/hero-title endpoint
            const response = await request(app)
                .put('/api/admin/general-info/hero-title')
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .send(updatedGeneralInfo);

            // Assert: Check if the application correctly handled the update
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("Hero title updated successfully");
        });
        // happy path - update general with hero_subtitle
        it('should update general information with hero_subtitle', async () => {
            // Arrange: update the general information hero_subtitle
            const updatedGeneralInfo = {
                hero_subtitle: 'Updated Hero Subtitle',
            };

            // Act: Make a PUT request to the /api/admin/general-info/hero-subtitle endpoint
            const response = await request(app)
                .put('/api/admin/general-info/hero-subtitle')
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .send(updatedGeneralInfo);

            // Assert: Check if the application correctly handled the update
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("Hero subtitle updated successfully");
        });

        // happy path - update general with hero_image
        it('should update general information with hero_image', async () => {
            // no arrange
            const response = await request(app)
                .put('/api/admin/general-info/hero-image')
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .attach('hero_image', get_fixture_image());

            // Assert: Check if the application correctly handled the update
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("Hero image updated successfully");

            let hero_image_name=response.body.hero_image;

            // ensure the uploaded file exist
            const new_image_exist=ensure_uploaded_file_exist(subfolder,hero_image_name);
            expect(new_image_exist).toBe(true);
        });


        // happy path - update general with about_summary
        it('should update general information with about_summary', async () => {
            // Arrange: update the general information about_summary
            const updatedGeneralInfo = {
                about_summary: 'Another Updated about summary',
            };
            // Act: Make a PUT request to the /api/admin/general-info/about-summary endpoint
            const response = await request(app)
                .put('/api/admin/general-info/about-summary')
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .send(updatedGeneralInfo);

            // Assert: Check if the application correctly handled the update
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("About summary updated successfully");
        });

        // happy path - update about about section image
        it("should update the about section image", async () => {
            // no Arrange

            // Act: Make a PUT request to the /api/admin/general-info/about-summary endpoint
            const response = await request(app)
                .put('/api/admin/general-info/about-image')
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .attach('about_image', get_fixture_image());

            // Assert: Check if the application correctly handled the update
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("About image updated successfully");

            let about_image_name=response.body.about_image;

            // ensure the uploaded file exist
            const new_image_exist=ensure_uploaded_file_exist(subfolder,about_image_name);
            expect(new_image_exist).toBe(true);
        });

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
        // sad path - invalid about section picture
        it("should return 400 for invalid about section picture", async () => {
            // Act: Make a PUT request to the /api/admin/general-info/about-summary endpoint
            const response = await request(app)
                .put('/api/admin/general-info/about-summary')
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .attach('about_image', invalid_fixture_image());

            // Assert: Check if the application correctly handled the invalid picture
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toMatch("\"about_summary\" is required");
            expect(response.body.code).toBe('VALIDATION_ERROR');
        });

        //-- business hours

        // happy path - update business hours
        it('should update business hours', async () => {
            // Arrange: Prepare the updated business hours
            const updatedBusinessHours = {
                "day":"monday-friday", // use a range format
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
