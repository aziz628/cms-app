import request from "supertest";
import app from "../../app.js";
import { getAuthCookies } from '../helper/tools.js';

// api for pricing plans 
describe("Pricing API", () => {
    let authCookies;
    let pricing_plan_id;
    let feature_id;
    
    beforeAll(async () => {
        // Get authentication cookies before running the tests
        authCookies = await getAuthCookies();
    });
   
    describe("POST /api/admin/pricing-plans", () => {

        // happy path - create a new pricing plan
        it('should create a new pricing plan', async () => {
            // Arrange: Set up the new pricing plan data
            const newPricingPlan = {
                name: 'Premium Plan',
                price: 29.99,
                period: 'monthly',
            };

            // Act: Make a POST request to the /api/admin/pricing-plans endpoint
            const response = await request(app)
                .post('/api/admin/pricing')
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .send(newPricingPlan);

            // Assert: Check if the application correctly handled the creation
            expect(response.statusCode).toBe(201);
            expect(response.body).toBeDefined();
            expect(response.body.message).toBe('Pricing plan added successfully');
            expect(response.body.id).toBeDefined();


            // Store the created pricing plan ID for later use
            pricing_plan_id = response.body.id;
        });

        // happy path - create a feature
        it('should create a new feature for a pricing plan', async () => {
            // Arrange: Set up the new feature data
            const newFeature = {
                feature: 'Feature 3',
            };
            const response = await request(app)
                .post(`/api/admin/pricing/${pricing_plan_id}/features`)
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .send(newFeature);

            // Assert: Check if the application correctly handled the creation
            expect(response.statusCode).toBe(201);
            expect(response.body).toBeDefined();
            expect(response.body.message).toBe('Feature added successfully');
            expect(response.body.id).toBeDefined();

            // Store the created feature ID for later use
            feature_id = response.body.id;
        });
        // sad path - missing feature fields 
        it('should return 400 for empty request body', async () => {
            // Arrange: Set up an empty request body
            const emptyRequestBody = {};
            // Act: Make a POST request to the /api/admin/pricing-plans endpoint
            const response = await request(app)
                .post(`/api/admin/pricing/${pricing_plan_id}/features`)
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .send(emptyRequestBody);
            // Assert: Check if the application correctly handled the validation error
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toMatch(/"feature" is required/);
            expect(response.body.code).toBe('VALIDATION_ERROR');
        });

        // sad path - missing required fields
        it('should return 400 for missing required fields', async () => {
            // Arrange: Set up an incomplete pricing plan data
            const incompletePricingPlan = {
                name: 'Basic Plan'
                // Missing price, features, and description
            };
            

            // Act: Make a POST request to the /api/admin/pricing-plans endpoint
            const response = await request(app)
                .post('/api/admin/pricing')
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .send(incompletePricingPlan);

            // Assert: Check if the application correctly handled the validation error
            expect(response.statusCode).toBe(400);
            // first error message should be about the missing price
            expect(response.body.message).toMatch(/"price" is required/);
            expect(response.body.code).toBe('VALIDATION_ERROR');
        });

        // sad path - invalid data types
        it('should return 400 for invalid data types', async () => {
            // Arrange: Set up a pricing plan with invalid data types
            const invalidPricingPlan = {
                name: 'Invalid Plan',
                price: 'twenty-nine', // Invalid price type
                period: 'monthly',
            };

            // Act: Make a POST request to the /api/admin/pricing-plans endpoint
            const response = await request(app)
                .post('/api/admin/pricing')
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .send(invalidPricingPlan);

            // Assert: Check if the application correctly handled the validation error
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toMatch(/"price" must be a number/);
            expect(response.body.code).toBe('VALIDATION_ERROR');
        });
        
        // sad path - trying to add a feature to a non-existing pricing plan
        it('should return 404 for non-existing pricing plan when adding a feature', async () => {
            // Arrange: Set up the new feature data
            const newFeature = {
                feature: 'Feature X',
            };
            const nonExistingPlanId = 99999; // Assuming this ID does not exist

            // Act: Make a POST request to the /api/admin/pricing/:id/features endpoint
            const response = await request(app)
                .post(`/api/admin/pricing/${nonExistingPlanId}/features`)
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .send(newFeature);

            // Assert: Check if the application correctly handled the error
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('Pricing plan not found');
            expect(response.body.code).toBe('PRICING_PLAN_NOT_FOUND');
        });
    });

    describe("PUT /api/admin/pricing-plans/:id", () => {
        beforeAll(() => {
            // Ensure the pricing_plan_id is defined before running tests
            expect(pricing_plan_id).toBeDefined();
        })
        // happy path - update a pricing plan
        it('should update a pricing plan', async () => {
            
            // Arrange: Set up the updated pricing plan data
            const updatedPricingPlan = {
                name: 'Updated Premium Plan',
                price: 39.99,
                period: 'monthly',
            };

            // Act: Make a PUT request to the /api/admin/pricing-plans/:id endpoint
            const response = await request(app)
                .put(`/api/admin/pricing/${pricing_plan_id}`)
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .send(updatedPricingPlan);

            // Assert: Check if the application correctly handled the update
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Pricing plan updated successfully');
        })
        // happy path - update a feature
        it('should update a feature of a pricing plan', async () => {
            // Arrange: Set up the updated feature data
            const updatedFeature = {
                feature: 'Updated Feature 3',
            };
            

            // Act: Make a PUT request to the /api/admin/pricing-plans/:id/features endpoint
            const response = await request(app)
                .put(`/api/admin/pricing/${feature_id}/features`)
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .send(updatedFeature);
            // Assert: Check if the application correctly handled the update
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Feature updated successfully');
        });

        // sad path - empty request body
        it('should return 400 for empty request body', async () => {
            // Arrange: Set up an empty update data
            const emptyUpdate = {};
            // Act: Make a PUT request to the /api/admin/pricing-plans/:id endpoint
            const response = await request(app)
                .put(`/api/admin/pricing/${pricing_plan_id}`)
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .send(emptyUpdate);
            // Assert: Check if the application correctly handled the validation error
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toMatch(/At least one field must be provided for update/);
            expect(response.body.code).toBe('VALIDATION_ERROR');
        });

        // sad path - missing required fields
        it('should return 400 for missing required fields', async () => {
            // Arrange: Set up an empty update data
            const incompleteUpdate = {
                // Missing all required fields
            };

            // Act: Make a PUT request to the /api/admin/pricing-plans/:id endpoint
            const response = await request(app)
                .put(`/api/admin/pricing/${pricing_plan_id}`)
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .send(incompleteUpdate);

            // Assert: Check if the application correctly handled the validation error
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toMatch(/At least one field must be provided for update/);
            expect(response.body.code).toBe('VALIDATION_ERROR');
        })

        // sad path - invalid data types
        it('should return 400 for invalid data types', async () => {
            // Arrange: Set up an update data with invalid types
            const invalidUpdate = {
                name: 'Invalid Update Plan',
                price: 'forty-nine', // Invalid price type
                period: 'monthly',
            };
            // Act: Make a PUT request to the /api/admin/pricing-plans/:id endpoint
            const response = await request(app)
                .put(`/api/admin/pricing/${pricing_plan_id}`)
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .send(invalidUpdate);

            // Assert: Check if the application correctly handled the validation error
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toMatch(/"price" must be a number/);
            expect(response.body.code).toBe('VALIDATION_ERROR');
        })
        
        // sad path - trying to update a non-existing pricing plan
        it('should return 404 for non-existing pricing plan', async () => {
            // Arrange: Use a non-existing pricing plan ID
            const nonExistingPlanId = 99999; // Assuming this ID does not exist
            const updateData = {
                name: 'Non-existing Plan',
                price: 19.99,
                period: 'monthly',
            };

            // Act: Make a PUT request to a non-existing pricing plan ID
            const response = await request(app)
                .put(`/api/admin/pricing/${nonExistingPlanId}`)
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .send(updateData);

            // Assert: Check if the application correctly handled the not found error
            expect(response.statusCode).toBe(404);
            //No pricing plan found with ID 99999
            expect(response.body.message).toBe(`No pricing plan found with ID ${nonExistingPlanId}`);
            expect(response.body.code).toBe('PRICING_PLAN_NOT_FOUND');
            // Feature not found for id ${feature_id}
        })
    });
     describe("GET /api/admin/pricing-plans", () => {
        // happy path - get all pricing plans
        it('should return all pricing plans', async () => {
            // Act: Make a GET request to the /api/admin/pricing-plans endpoint
            const response = await request(app)
                .get('/api/admin/pricing')
                .set('Cookie', authCookies); // Use the auth cookies for authentication

            expect(response.statusCode).toBe(200);
            expect(response.body).toBeDefined();
            
            // pricing plans should be an array of objects
            for (const pricing_plan of response.body) {
                expect(pricing_plan.id).toBeDefined();
                expect(pricing_plan.name).toBeDefined();
                expect(pricing_plan.price).toBeDefined();
                expect(pricing_plan.period).toBeDefined();
                expect(pricing_plan.features).toBeDefined();
                for (const feature of pricing_plan.features) {
                    expect(feature.id).toBeDefined();
                    expect(feature.feature).toBeDefined();
                }
            }
        });

        // sad path - unauthorized access
        it('should return 401 for unauthorized access', async () => {
            // Act: Make a GET request to the /api/admin/pricing-plans endpoint without authentication
            const response = await request(app)
                .get('/api/admin/pricing');

            // Assert: Check if the application correctly handled the unauthorized access
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
            expect(response.body.code).toBe('UNAUTHORIZED');
        });
    });
    describe("DELETE /api/admin/pricing-plans/:id", () => {

        // Ensure the pricing_plan_id is defined before running tests
        beforeAll(() => {

            // Check if the pricing_plan_id is defined
            expect(pricing_plan_id).toBeDefined();
        })
        // happy path - delete a feature
        it('should delete a feature from a pricing plan', async () => {
            // Act: Make a DELETE request to the /api/admin/pricing-plans/:id/features/:featureId endpoint
            const response = await request(app)
                .delete(`/api/admin/pricing/${feature_id}/features`)
                .set('Cookie', authCookies); // Use the auth cookies for authentication

            // Assert: Check if the application correctly handled the deletion
            expect(response.statusCode).toBe(204);
            expect(response.body).toEqual({}); // Expect an empty response body
        });

        // sad path - trying to delete a non-existing feature
        it('should return 404 for non-existing feature', async () => {
            // Arrange: Use a non-existing feature ID
            const nonExistingFeatureId = 99999; // Assuming this ID does not exist
            // Act: Make a DELETE request to a non-existing feature ID
            const response = await request(app)
                .delete(`/api/admin/pricing/${nonExistingFeatureId}/features`)
                .set('Cookie', authCookies); // Use the auth cookies for authentication
            // Assert: Check if the application correctly handled the not found error
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe(`Feature not found for id ${nonExistingFeatureId}`);
            expect(response.body.code).toBe('FEATURE_NOT_FOUND');
        });

        // happy path - delete a pricing plan
        it('should delete a pricing plan', async () => {
            // Act: Make a DELETE request to the /api/admin/pricing-plans/:id endpoint
            const response = await request(app)
                .delete(`/api/admin/pricing/${pricing_plan_id}`)
                .set('Cookie', authCookies); // Use the auth cookies for authentication

            // Assert: Check if the application correctly handled the deletion
            expect(response.statusCode).toBe(204);
            expect(response.body).toEqual({}); // Expect an empty response body
        });

        // sad path - trying to delete a non-existing pricing plan
        it('should return 404 for non-existing pricing plan', async () => {
            // Arrange: Use a non-existing pricing plan ID
            const nonExistingPlanId = 99999; // Assuming this ID does not exist
            // Act: Make a DELETE request to a non-existing pricing plan ID
            const response = await request(app)
                .delete(`/api/admin/pricing/${nonExistingPlanId}`)
                .set('Cookie', authCookies); // Use the auth cookies for authentication

            // Assert: Check if the application correctly handled the not found error
            expect(response.statusCode).toBe(404);
            //No pricing plan found with ID 99999
            expect(response.body.message).toBe(`No pricing plan found with ID ${nonExistingPlanId}`);
            expect(response.body.code).toBe('PRICING_PLAN_NOT_FOUND');
        });
    })
})