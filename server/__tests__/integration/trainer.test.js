import request from "supertest";
import app from "../../app.js";

import { getAuthCookies,get_fixture_image,ensure_uploaded_file_exist ,invalid_fixture_image,check_no_file_in_uploads} from '../helper/tools.js';

const upload_subfolder = 'trainers';
const allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']; // Allowed file types


describe("Trainer API", () => {
    let authCookies; // Variable to store authentication cookies
    let trainerId; // Variable to store the created trainer ID
    let trainerImage; // Variable to store the uploaded trainer image
    beforeAll(async () => {
        authCookies = await getAuthCookies();
    });
    afterAll(async () => {
        const noFilesExist =  check_no_file_in_uploads(upload_subfolder);
        expect(noFilesExist).toBe(true);
    })
    describe("GET /api/admin/trainers", () => {
        // happy path - get all trainers
        it('should return all trainers', async () => {
            // Act: Make a GET request to the /api/admin/trainers endpoint
            const response = await request(app)
                .get('/api/admin/trainers')
                .set('Cookie', authCookies); // Use the auth cookies for authentication

            // Assert: Check if the response is successful
            expect(response.statusCode).toBe(200);
            expect(response.body).toBeDefined();
           
            for(const trainer of response.body) {
                expect(trainer).toHaveProperty('id');
                expect(trainer).toHaveProperty('name');
                expect(trainer).toHaveProperty('speciality');
                expect(trainer).toHaveProperty('certificate');
                expect(trainer).toHaveProperty('years_of_experience');
                expect(trainer).toHaveProperty('image');
            }
        });

        // sad path - unauthorized access
        it('should return 401 for unauthorized access', async () => {
            // Act: Make a GET request to the /api/admin/trainers endpoint without authentication
            const response = await request(app)
                .get('/api/admin/trainers');

            // Assert: Check if the application correctly handled the unauthorized access
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
            expect(response.body.code).toBe('UNAUTHORIZED');
        });
    });
    describe("POST /api/admin/trainers", () => {
        
        // happy path - create a new trainer
        it("should create a new trainer", async () => {

            // Arrange: Prepare the new trainer data
            const newTrainer = {
                name: "John Doe",
                speciality: "Yoga",
                certificate: "Certified Yoga Instructor",
                years_of_experience: 5
            };

            // Act: Perform a POST request to the /api/admin/trainers endpoint
            const response = await request(app)
                .post('/api/admin/trainers')
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .field('name', newTrainer.name)
                .field('speciality', newTrainer.speciality)
                .field('certificate', newTrainer.certificate)
                .field('years_of_experience', newTrainer.years_of_experience)
                .attach('image', get_fixture_image()); // Attach the trainer image

            // Assert: Check if the trainer was created successfully
            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe('Trainer added successfully');
            expect(typeof response.body.id).toBe('number');

            // check if image is uploaded
            const image_exists = ensure_uploaded_file_exist(upload_subfolder,response.body.image);
            expect(image_exists).toBe(true);
            
            trainerId = response.body.id; // Store the trainer ID for later use
            trainerImage = response.body.image; // Store the trainer image for later use
        });
        // sad path - missing required fields
        it("should return 400 for missing required fields", async () => {
            // Arrange: Prepare the new trainer data with missing fields
            const incompleteTrainer = {
                name: "Jane Doe",
                speciality: "Pilates"
                // Missing certificate and years_of_experience
            };

            // Act: Perform a POST request to the /api/admin/trainers endpoint
            const response = await request(app)
                .post('/api/admin/trainers')
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .field('name', incompleteTrainer.name)
                .field('speciality', incompleteTrainer.speciality)  

            // Assert: Check if the application correctly handled the error
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('"certificate" is required');
            expect(response.body.code).toBe('VALIDATION_ERROR');
        });
        // sad path - invalid years_of_experience
        it("should return 400 for invalid years_of_experience", async () => {
            // Arrange: Prepare the new trainer data with invalid years_of_experience
            const invalidTrainer = {
                name: "Invalid Trainer",
                speciality: "Fitness",
                certificate: "Certified Fitness Trainer",
                years_of_experience: -1 // Invalid value
            };

            // Act: Perform a POST request to the /api/admin/trainers endpoint
            const response = await request(app)
                .post('/api/admin/trainers')
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .field('name', invalidTrainer.name)
                .field('speciality', invalidTrainer.speciality)
                .field('certificate', invalidTrainer.certificate)
                .field('years_of_experience', invalidTrainer.years_of_experience);

            // Assert: Check if the application correctly handled the error
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('"years_of_experience" must be ≥ 0');
            expect(response.body.code).toBe('VALIDATION_ERROR');
        })
        // sad path - no image uploaded
        it("should return 400 for missing trainer image", async () => {
            // Arrange: Prepare the new trainer data without an image
            const newTrainer = {
                name: "No Image Trainer",
                speciality: "Cardio",
                certificate: "Certified Cardio Trainer",
                years_of_experience: 3
            };

            // Act: Perform a POST request to the /api/admin/trainers endpoint without an image
            const response = await request(app)
                .post('/api/admin/trainers')
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .field('name', newTrainer.name)
                .field('speciality', newTrainer.speciality)
                .field('certificate', newTrainer.certificate)
                .field('years_of_experience', newTrainer.years_of_experience);

            // Assert: Check if the application correctly handled the missing image
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe(`Files required: image`);
            expect(response.body.code).toBe('FILE_REQUIRED');
        })
    });
    describe("PUT /api/admin/trainers/:id", () => {
        // Ensure the trainer_id is defined before running tests
        beforeAll(() => {

            // Check if the trainer_id is defined
            expect(trainerId).toBeDefined();
        })
        // happy path - update a trainer
        it("should update a trainer", async () => {
            // Arrange: Prepare the updated trainer data
            const updatedTrainer = {
                name: "John Smith",
                speciality: "Advanced Yoga",
                certificate: "Certified Advanced Yoga Instructor",
                years_of_experience: 6
            };

            // Act: Perform a PUT request to the /api/admin/trainers/:id endpoint
            const response = await request(app)
                .put(`/api/admin/trainers/${trainerId}`)
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .field('name', updatedTrainer.name)
                .field('speciality', updatedTrainer.speciality)
                .field('certificate', updatedTrainer.certificate)
                .field('years_of_experience', updatedTrainer.years_of_experience)
                .attach('image', get_fixture_image(1)); // Use a different image for the update

            // Assert: Check if the trainer was updated successfully
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Trainer updated successfully');
            expect(response.body.image).toBeDefined(); // Check if the image field is returned

            // check if old image is deleted
            const old_image_exists = ensure_uploaded_file_exist(upload_subfolder, trainerImage);
            expect(old_image_exists).toBe(false);


            // check if new image is uploaded
            const new_image_exists = ensure_uploaded_file_exist(upload_subfolder, response.body.image);
            expect(new_image_exists).toBe(true);

            // Store the trainer image for later use
            trainerImage = response.body.image;
        })

        // sad path - update with no fields
        it("should return 400 for missing fields during update", async () => {
            // Act: Perform a PUT request to the /api/admin/trainers/:id endpoint with no fields
            const response = await request(app)
                .put(`/api/admin/trainers/${trainerId}`)
                .set('Cookie', authCookies) // Use the auth cookies for authentication
            
            // Assert: Check if the application correctly handled the error
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('At least one field or a file must be provided for an update.');
            expect(response.body.code).toBe('UPDATE_EMPTY');
        })
        // sad path - update with invalid years_of_experience
        it("should return 400 for invalid years_of_experience during update", async () =>{
            // arrange: Prepare the updated trainer data with invalid years_of_experience
            const invalidUpdate = {
                years_of_experience: -1 // Invalid value
            };

            // Act: Perform a PUT request to the /api/admin/trainers/:id endpoint
            const response = await request(app)
                .put(`/api/admin/trainers/${trainerId}`)
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .field('years_of_experience', invalidUpdate.years_of_experience)
                .attach('image', get_fixture_image(2));

            // Assert: Check if the application correctly handled the error
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('"years_of_experience" must be ≥ 0');
            expect(response.body.code).toBe('VALIDATION_ERROR');
        })

        // sad path - update with invalid trainer ID
        it("should return 404 for invalid trainer ID", async () => {
            // arrange: Prepare an invalid trainer ID
            const invalidTrainerId = 9999; // Assuming this ID does not exist

            // Act: Perform a PUT request to the /api/admin/trainers/:id endpoint with an invalid ID
            const response = await request(app)
                .put(`/api/admin/trainers/${invalidTrainerId}`)
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .attach('image', get_fixture_image(1));

            // Assert: Check if the application correctly handled the error
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe(`Trainer with ID ${invalidTrainerId} not found`);
            expect(response.body.code).toBe('TRAINER_NOT_FOUND');
        })
        // sad path - update with invalid image type
        it("should return 400 for invalid image type during update", async () => {

            // Act: Perform a PUT request to the /api/admin/trainers/:id endpoint with an invalid image type
            const response = await request(app)
                .put(`/api/admin/trainers/${trainerId}`)
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .attach('image', invalid_fixture_image()); // Invalid image type

            // Assert: Check if the application correctly handled the error
            expect(response.statusCode).toBe(400);
            // use the allowedFileTypes array to check for valid file types
            expect(response.body.message).toBe(`Invalid file type. Allowed: ${allowedFileTypes.join(', ')}`);
            expect(response.body.code).toBe('INVALID_FILE_TYPE');
        })
        // sad path - update with invalid trainer ID format
        it("should return 400 for invalid trainer ID format", async () => {
            // Arrange: Prepare an invalid trainer ID format
            const invalidTrainerId = "invalid_id_format"; // Non-numeric ID

            // Act: Perform a PUT request to the /api/admin/trainers/:id endpoint with an invalid ID format
            const response = await request(app)
                .put(`/api/admin/trainers/${invalidTrainerId}`)
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .attach('image', get_fixture_image(1));

            // Assert: Check if the application correctly handled the error
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toMatch(/"id" must be a number/);
            expect(response.body.code).toBe('VALIDATION_ERROR');
        })
    })
    describe("DELETE /api/admin/trainers/:id", () => {
        // Ensure the trainer_id is defined before running tests
        beforeAll(() => {

            // Check if the trainer_id is defined
            expect(trainerId).toBeDefined();
        })

        // happy path - delete a trainer
        it("should delete a trainer", async () => {
            const response = await request(app)
                .delete(`/api/admin/trainers/${trainerId}`)
                .set('Cookie', authCookies); // Use the auth cookies for authentication

            // Assert: Check if the trainer was deleted successfully
            expect(response.statusCode).toBe(204);
            expect(response.body).toEqual({}); // No content expected in the response body
            // Check if the trainer image file is deleted
            const image_exists = ensure_uploaded_file_exist(upload_subfolder, trainerImage);
            expect(image_exists).toBe(false);
        })
        // sad path - delete with invalid trainer ID
        it("should return 404 for invalid trainer ID", async () => {
            // Arrange: Prepare an invalid trainer ID
            const invalidTrainerId = 9999; // Assuming this ID does not exist

            // Act: Perform a DELETE request to the /api/admin/trainers/:id endpoint with an invalid ID
            const response = await request(app)
                .delete(`/api/admin/trainers/${invalidTrainerId}`)
                .set('Cookie', authCookies); // Use the auth cookies for authentication

            // Assert: Check if the application correctly handled the error
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe(`Trainer with ID ${invalidTrainerId} not found`);
            expect(response.body.code).toBe('TRAINER_NOT_FOUND');
        })
    })
});