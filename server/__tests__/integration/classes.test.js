import request from "supertest";
import app from "../../app.js";

import { getAuthCookies,get_fixture_image,ensure_uploaded_file_exist ,invalid_fixture_image,check_no_file_in_uploads} from '../helper/tools.js';
// get current directory name
const upload_subfolder = 'classes'
const allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']; // Allowed file types

describe("General Info API", () => {
    
    // prepare cookies for authentication
    let authCookies;    
    let test_class_id;
    let imageName;

    beforeAll(async () => {
      authCookies = await getAuthCookies();
    });
    
    afterAll(async() => {
            const noFilesExist = check_no_file_in_uploads(upload_subfolder);
            expect(noFilesExist).toBe(true);
        });
    
    describe("POST /api/admin/classes", () => {

        // happy path - add a class
        it('should create  a class and return a status code 201', async () => {
            // Arrange: Set up a new class object to be added
            const newClass = {
                name: 'New Class',
                description: 'This is a new class',
                private_coaching: true
            };
            // Act: Perform a POST request to the /api/admin/classes endpoint
            const response = await request(app)
                .post('/api/admin/classes')
                .set('Cookie', authCookies)
                .field('name', newClass.name)
                .field('description', newClass.description)
                .field('private_coaching', newClass.private_coaching)
                .attach('image', get_fixture_image()); // Attach an image file


            // Assert: Check if the application correctly handled the addition of the class
            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe('Class added successfully');
            expect(typeof response.body.id).toBe('number');
            expect(response.body.image).toBeDefined();
            // check image existence
            const image_exist= ensure_uploaded_file_exist(upload_subfolder,response.body.image);
            expect(image_exist).toBe(true);

            test_class_id = response.body.id; // Store the class ID for later use
            imageName = response.body.image; // Store the image name for later use
        });
    
        

        // sad path - missing required fields
        it('should return status code 400 for missing required fields', async () => {
            // Arrange: Set up a class object with missing fields
            const incompleteClass = {
                name: 'Incomplete Class'
                // Missing description and private_coaching
            };

            // Act: Perform a POST request to the /api/admin/classes endpoint
            const response = await request(app)
                .post('/api/admin/classes')
                .set('Cookie', authCookies)
                .field('name', incompleteClass.name);

            // Assert: Check if the application correctly handled the missing fields
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toMatch(/"description" is required/);
            expect(response.body.code).toBe('VALIDATION_ERROR');

            // ensure no image is uploaded
            const image_exist= ensure_uploaded_file_exist(upload_subfolder,'testing_image.jpg');
            expect(image_exist).toBe(false);
        });
        // sad path -  missing image
        it('should return status code 400 for missing image', async () => {
            // Arrange: Set up a class object with missing image
            const incompleteClass = {
                name: 'Incomplete Class',
                description: 'This class has no image',
                private_coaching: false
            };

            // Act: Perform a POST request to the /api/admin/classes endpoint without an image
            const response = await request(app)
                .post('/api/admin/classes')
                .set('Cookie', authCookies)
                .field('name', incompleteClass.name)
                .field('description', incompleteClass.description)
                .field('private_coaching', incompleteClass.private_coaching);

            // Assert: Check if the application correctly handled the missing image
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Files required: image");
            expect(response.body.code).toBe("FILE_REQUIRED");
        });
        // sad path - invalid image type
        it('should return status code 400 for invalid image type', async () => {
            // Arrange: Set up a class object with an invalid image type
            const invalidImageClass = {
                name: 'Invalid Image Class',
                description: 'This class has an invalid image type',
                private_coaching: false
            };

            // Act: Perform a POST request to the /api/admin/classes endpoint with an invalid image type
            const response = await request(app)
                .post('/api/admin/classes')
                .set('Cookie', authCookies)
                .field('name', invalidImageClass.name)
                .field('description', invalidImageClass.description)
                .field('private_coaching', invalidImageClass.private_coaching)
                .attach('image', invalid_fixture_image());

            // Assert: Check if the application correctly handled the invalid image type
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe(`Invalid file type. Allowed: ${allowedFileTypes.join(', ')}`);
            expect(response.body.code).toBe("INVALID_FILE_TYPE");
            // check image non-existence
            const image_exist= ensure_uploaded_file_exist(upload_subfolder,'invalid_file.txt');
            expect(image_exist).toBe(false);
        });

    });

    describe("PUT /api/admin/classes/:id", () => {
        
        // happy path - update a class with only fields
        it('should update a class with only fields and return status code 200', async () => {
            expect(test_class_id).toBeDefined(); // Ensure the class ID is available
            // Arrange: Set up an updated class object with only fields
            const updatedClass = {
                name: 'Updated Class',
                description: 'This is an updated class',
                private_coaching: false
            };
            // Act: Perform a PUT request to the /api/admin/classes/:id endpoint
            const response = await request(app)
                .put(`/api/admin/classes/${test_class_id}`)
                .set('Cookie', authCookies)
                .send(updatedClass);
            // Assert: Check if the application correctly handled the update
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Class updated successfully');
        })
        // happy path - update a class with fields and image
        it('should update a class and return status code 200', async () => {
            expect(test_class_id).toBeDefined(); // Ensure the class ID is available

            // Arrange: Set up an updated class object
            const updatedClass = {
                name: 'Updated Class',
                description: 'This is an updated class',
                private_coaching: false
            };

            // Act: Perform a PUT request to the /api/admin/classes/:id endpoint
            const response = await request(app)
                .put(`/api/admin/classes/${test_class_id}`)
                .set('Cookie', authCookies)
                .field('name', updatedClass.name)
                .field('description', updatedClass.description)
                .field('private_coaching', updatedClass.private_coaching)
                .attach('image', get_fixture_image(1)); // Attach a new image file
            // Assert: Check if the application correctly handled the update
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Class updated successfully');
            expect(response.body.image).toBeDefined(); // Check if the image is returned
            

            // check if the old image is deleted from the uploads directory
            const old_image_exists = ensure_uploaded_file_exist(upload_subfolder,imageName); 
            expect(old_image_exists).toBe(false)

            // check if the new image is added to the uploads directory
            const new_image_exist = ensure_uploaded_file_exist(upload_subfolder,response.body.image);
            expect(new_image_exist).toBe(true);

            imageName = response.body.image; // Update the image name for later use

        });
        // sad path - missing required fields
        it("shoud return 400 for missing class fields during update ", async () => {
            expect(test_class_id).toBeDefined(); // Ensure the class ID is available
            
            // Arrange : Set up an updated class object with missing fields
            const updatedClass = {};
            // Act: Perform a PUT request to the /api/admin/classes/:id endpoint with missing fields
            const response = await request(app)
                .put(`/api/admin/classes/${test_class_id}`)
                .set('Cookie', authCookies)
                .send(updatedClass);
            // Assert: Check if the application correctly handled the missing fields
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('At least one field or a file must be provided for an update.');
            expect(response.body.code).toBe('UPDATE_EMPTY');
           
        })
        // sad path - invalid image type
        it('should return status code 400 for invalid image type during update', async () =>{
            expect(test_class_id).toBeDefined(); // Ensure the class ID is available
            
            // Arrange: Set up an updated class object with an invalid image type
            const updatedClass = {
                name: 'Invalid Image Class',
                description: 'This class has an invalid image type',
                private_coaching: false
            };

            // Act: Perform a PUT request to the /api/admin/classes/:id endpoint with an invalid image type
            const response = await request(app)
                .put(`/api/admin/classes/${test_class_id}`)
                .set('Cookie', authCookies)
                .field('name', updatedClass.name)
                .field('description', updatedClass.description)
                .field('private_coaching', updatedClass.private_coaching)
                .attach('image', invalid_fixture_image());

            // Assert: Check if the application correctly handled the invalid image type
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe(`Invalid file type. Allowed: ${allowedFileTypes.join(', ')}`);
            expect(response.body.code).toBe("INVALID_FILE_TYPE");
        });
        // sad path - using invalid class id
        it('should return status code 404 for invalid class id', async () => {
            // Arrange: Set up an invalid class ID
            const invalidClassId = 999999; // Assuming this ID does not exist

            // Act: Perform a PUT request to the /api/admin/classes/:id endpoint with an invalid class ID
            const response = await request(app)
                .put(`/api/admin/classes/${invalidClassId}`)
                .set('Cookie', authCookies)
                .send({
                    name: 'Invalid Class',
                    description: 'This class does not exist',
                    private_coaching: false
                });

            // Assert: Check if the application correctly handled the invalid class ID
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe(`Class with ID ${invalidClassId} not found`);
            expect(response.body.code).toBe('CLASS_NOT_FOUND');
        })
    });
        // the get test result after previous posts and puts to ensure data exists
    describe("GET /api/admin/classes", () => {

        // happy path - get classes
        it('should return all classes and status code 200', async () => {
            // Act: Make a GET request to the /api/admin/classes endpoint
            const response = await request(app)
                .get('/api/admin/classes')
                .set('Cookie', authCookies); // Use the auth cookies for authentication

            // Assert: Check if the application correctly returned the classes
            expect(response.statusCode).toBe(200);
            expect(response.body).toBeDefined();

            // body is array of objects with each having ids and name, private_coaching,image 
            for (const item of response.body) {
                expect(typeof item).toBe('object');
                // value object have name , private_coaching,image
                expect(item).toHaveProperty('name');
                expect(item).toHaveProperty('private_coaching');
                expect(item).toHaveProperty('image');
            }

        });

        // sad path - unauthorized access
        it('should return status code 401 for unauthorized access', async () => {
            // Act: Make a GET request to the /api/admin/classes endpoint without authentication
            const response = await request(app)
                .get('/api/admin/classes');

            // Assert: Check if the application correctly handled unauthorized access
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
            expect(response.body.code).toBe('UNAUTHORIZED');
        });

    });
    describe("DELETE /api/admin/classes/:id", () => {

        // happy path - delete a class
        it('should delete a class and return status code 200', async () => {
            expect(test_class_id).toBeDefined(); // Ensure the class ID is available
            
            // Arrange: no additional setup needed

            // Act: Perform a DELETE request to the /api/admin/classes/:id endpoint
            const response = await request(app)
                .delete(`/api/admin/classes/${test_class_id}`)
                .set('Cookie', authCookies);

            // Assert: Check if the application correctly handled the deletion
            expect(response.statusCode).toBe(204); // No content status code for successful deletion
            expect(response.body).toEqual({}); // Body should be empty
            
            // check if the image is deleted from the uploads directory
            const imagePath = ensure_uploaded_file_exist(upload_subfolder,imageName);
            expect(imagePath).toBe(false); // Ensure the image file is deleted
        });
        
        // sad path - using invalid class id
        it('should return status code 404 for invalid class id', async () => {
            // Arrange: Set up an invalid class ID
            const invalidClassId = 999999; // Assuming this ID does not exist

            // Act: Perform a DELETE request to the /api/admin/classes/:id endpoint with an invalid class ID
            const response = await request(app)
                .delete(`/api/admin/classes/${invalidClassId}`)
                .set('Cookie', authCookies);

            // Assert: Check if the application correctly handled the invalid class ID
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe(`Class with ID ${invalidClassId} not found`);
            expect(response.body.code).toBe('CLASS_NOT_FOUND');
        }) 

    });
    
});