import request  from "supertest";
import app from "../../app.js";
import { getAuthCookies } from '../helper/tools.js';


describe("Schedule API", () => {
    let authCookies;
    let sessionId;
    let class_id;

    beforeAll(async () => {
        authCookies = await getAuthCookies();
        
        // create a class to use its id for the schedule tests
        const classResponse = await request(app)
        .post('/api/admin/classes')
        .set('Cookie', authCookies)
        .field('name', "Schedule Test Class")
        .field('description', "This is a class for schedule tests")
        .field('private_coaching', false)
        .attach('image', '__tests__/fixtures/testing_image.jpg');
        
        expect(typeof classResponse.body.id).toBe('number');
        class_id = classResponse.body.id;

    });
    afterAll(async () => {
        // clean up - delete the created class
        await request(app)
        .delete(`/api/admin/classes/${class_id}`)
        .set('Cookie', authCookies);
    });

  
    describe("POST /api/admin/schedule", () => {

        // happy path - create a new session
        it("should create a new session", async () => {
            // Arrange: Prepare the session data

            const newSession = {
                start_time: "09:00",
                end_time: "10:00",
                day_of_week: "monday",
                class_id
            };
            
            //  Act: Perform a POST request to the /api/admin/schedule endpoint
            const response = await request(app)
                .post('/api/admin/schedule')
                .set('Cookie', authCookies)
                .send(newSession);

            // Assert: Check if the response is successful
            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe('Session added successfully');
            expect(response.body.id).toBeDefined();

            // Save the created session ID for future tests
            sessionId = response.body.id;
        });

        // sad path - missing required fields
        it("should return 400 for missing required fields", async () => {
            // Arrange: Prepare an incomplete session data
            const incompleteSession = {
                class_id: 1,
                start_time: "09:00"
                // end_time and day_of_week are missing
            };

            // Act: Perform a POST request to the /api/admin/schedule endpoint
            const response = await request(app)
                .post('/api/admin/schedule')
                .set('Cookie', authCookies)
                .send(incompleteSession);

            // Assert: Check if the response is a bad request
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toMatch(/"end_time" is required/);
            expect(response.body.code).toBe('VALIDATION_ERROR');
        });

        // sad path - invalid id format
        it("should return 400 for invalid class_id format", async () => {
            // Arrange: Prepare a session with an invalid class_id
            const invalidSession = {
                class_id: "invalid_id", // This should be a number
                start_time: "09:00",
                end_time: "10:00",
                day_of_week: "monday"
            };

            // Act: Perform a POST request to the /api/admin/schedule endpoint
            const response = await request(app)
                .post('/api/admin/schedule')
                .set('Cookie', authCookies)
                .send(invalidSession);

            // Assert: Check if the response is a bad request
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toMatch(/"class_id" must be a number/);
            expect(response.body.code).toBe('VALIDATION_ERROR');
        });

        // sad path - invalid time format
        it("should return 400 for invalid time format", async () => {
            // Arrange: Prepare a session with an invalid time format
            const invalidTimeSession = {
                class_id: 1,
                start_time: "09:00",
                end_time: "invalid_time", // This should be a valid time format
                day_of_week: "monday"
            };

            // Act: Perform a POST request to the /api/admin/schedule endpoint
            const response = await request(app)
                .post('/api/admin/schedule')
                .set('Cookie', authCookies)
                .send(invalidTimeSession);

            // Assert: Check if the response is a bad request
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('"end_time" must be in 24-hour format (HH:MM)');
            expect(response.body.code).toBe('VALIDATION_ERROR');
        });
    })
    describe("PUT /api/admin/schedule/:id", () => {

        // Ensure the session ID is defined before running tests
        beforeAll(() => {

            // Check if the sessionId is defined
            expect(sessionId).toBeDefined();
        })
        // happy path - update a session
        it("should update a session", async () => {
            // Arrange : create new class to update the session to use its id
            const classResponse = await request(app)
            .post('/api/admin/classes')
            .set('Cookie', authCookies)
            .field('name', "Schedule Update Test Class")
            .field('description', "This is a class for schedule update tests")
            .field('private_coaching', false)
            .attach('image', '__tests__/fixtures/testing_image.jpg');
            
            expect(typeof classResponse.body.id).toBe('number');
            const new_class_id = classResponse.body.id;
            // Prepare the updated session data
            const updatedSession = {
                class_id: new_class_id,
                start_time: "10:00",
                end_time: "11:00",
                day_of_week: "tuesday"
            };

            // Act: Perform a PUT request to the /api/admin/schedule/:id endpoint
            const response = await request(app)
                .put(`/api/admin/schedule/${sessionId}`)
                .set('Cookie', authCookies)
                .send(updatedSession);

            // Assert: Check if the response is successful
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Session updated successfully');
            // delete the old class and use the new one for future tests
            await request(app)
            .delete(`/api/admin/classes/${class_id}`)
            .set('Cookie', authCookies);
            class_id = new_class_id;
        });
        // sad path - session not found
        it("should return 404 for non-existing session", async () => {
            // Arrange: Use a non-existing session ID
            const nonExistingSessionId = 9999;

            // Prepare the updated session data
            const updatedSession = {
                class_id: 1,
                start_time: "10:00",
                end_time: "11:00",
                day_of_week: "tuesday"
            };

            // Act: Perform a PUT request to the /api/admin/schedule/:id endpoint
            const response = await request(app)
                .put(`/api/admin/schedule/${nonExistingSessionId}`)
                .set('Cookie', authCookies)
                .send(updatedSession);

            // Assert: Check if the response is not found
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('Session not found');
            expect(response.body.code).toBe('SESSION_NOT_FOUND');
        });
        // sad path - invalid id format
        it("should return 400 for invalid session ID format", async () => {
            // Arrange: Use an invalid session ID format
            const invalidSessionId = "invalid_id";

            // Act: Perform a PUT request to the /api/admin/schedule/:id endpoint
            const response = await request(app)
                .put(`/api/admin/schedule/${invalidSessionId}`)
                .set('Cookie', authCookies)
                .send();

            // Assert: Check if the response is a bad request
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toMatch(/"id" must be a number/);
            expect(response.body.code).toBe('VALIDATION_ERROR');
        });
        // sad path - invalid time format
        it("should return 400 for invalid time format", async () => {
            // Arrange: Ensure a session exists before updating
            expect(sessionId).toBeDefined();

            // Prepare the updated session data with an invalid time format
            const updatedSession = {
                class_id: 1,
                start_time: "10:00",
                end_time: "invalid_time", // This should be a valid time format
                day_of_week: "tuesday"
            };

            // Act: Perform a PUT request to the /api/admin/schedule/:id endpoint
            const response = await request(app)
                .put(`/api/admin/schedule/${sessionId}`)
                .set('Cookie', authCookies)
                .send(updatedSession);

            // Assert: Check if the response is a bad request
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('"end_time" must be in 24-hour format (HH:MM)');
            expect(response.body.code).toBe('VALIDATION_ERROR');
        });
    });
  describe("GET /api/admin/schedules", () => {
        // happy path - get all schedules
        it("should return all schedules", async () => {

            // Act: Perform a GET request to the /api/admin/schedule endpoint
            const response = await request(app)
                .get('/api/admin/schedule')
                .set('Cookie', authCookies);

            // Assert: Check if the response is successful and contains schedules
            expect(response.statusCode).toBe(200);
            expect(response.body).toBeDefined();
            
            // Check the structure of each schedule
            // body is object of objects
          
            for(const schedule of response.body) {
                expect(schedule).toHaveProperty('id');
                expect(schedule).toHaveProperty('class_id');
                expect(schedule).toHaveProperty('start_time');
                expect(schedule).toHaveProperty('end_time');
                expect(schedule).toHaveProperty('day_of_week');
                expect(schedule).toHaveProperty('class_name');
            }
               
        })
        // sad path - unauthorized access
        it("should return 401 for unauthorized access", async () => {
            // Arrange: no setup needed
            // Act: Perform a GET request to the schedule endpoint without authentication
            const response = await request(app).get('/api/admin/schedule');

            // Assert: Check if the response is unauthorized
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
            expect(response.body.code).toBe('UNAUTHORIZED');
        })
    })
    describe("DELETE /api/admin/schedule/:id", () => {

        // Ensure the session ID is defined before running tests
        beforeAll(() => {

            // Check if the sessionId is defined
            expect(sessionId).toBeDefined();
        })
        // happy path - delete a session
        it("should delete a session", async () => {

            // Arrange: no setup needed

            // Act: Perform a DELETE request to the /api/admin/schedule/:id endpoint
            const response = await request(app)
                .delete(`/api/admin/schedule/${sessionId}`)
                .set('Cookie', authCookies);

            // Assert: Check if the response is successful
            expect(response.statusCode).toBe(204);
            expect(response.body).toEqual({}); // No content expected
        });

        // sad path - session not found
        it("should return 404 for non-existing session", async () => {
            // Arrange: Use a non-existing session ID
            const nonExistingSessionId = 9999;

            // Act: Perform a DELETE request to the /api/admin/schedule/:id endpoint
            const response = await request(app)
                .delete(`/api/admin/schedule/${nonExistingSessionId}`)
                .set('Cookie', authCookies);

            // Assert: Check if the response is not found
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('Session not found');
            expect(response.body.code).toBe('SESSION_NOT_FOUND');
        });
    })
    });