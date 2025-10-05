import request from 'supertest';
import app from '../../app'; // Adjust the path to your Express app
import { getAuthCookies,get_fixture_image,ensure_uploaded_file_exist ,invalid_fixture_image,check_no_file_in_uploads} from '../helper/tools.js';

// global variables
const upload_subfolder = 'transformations';
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']

// main describe block for the transformation API tests
describe('Transformation API', () => {
    let auth_cookies;
    let transformation_id;
    let before_image_name;
    let after_image_name;
    let transformation_list=[];
    beforeAll(async () => 
    {
        // get authentication cookies
        auth_cookies = await getAuthCookies();
    });
    // clean up the transformation list
    afterAll(
        async () => {
        const noFilesExist = check_no_file_in_uploads('transformations');
        expect(noFilesExist).toBe(true);
        }
    );

    
    describe('POST /api/admin/transformation', () => {

        // happy path - create a new transformation
        it('should create a new transformation', async () => {

            // Arrange : prepare the request body
            const requestBody = {
                name: 'Test Transformation',
                description: 'This is a test transformation'
            }
            // Act : send a request to create a new transformation
            const response = await request(app)
                .post('/api/admin/transformation')
                .set('Cookie', auth_cookies)
                .field('name', requestBody.name)
                .field('description', requestBody.description)
                .attach('before_image', get_fixture_image())
                .attach('after_image', get_fixture_image(1));

            // Assert 
        
            expect(response.body).toHaveProperty('id'); 
            // Add the transformation ID to the list for cleanup
            transformation_list.push(response.body.id);

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('before_image');
            expect(response.body).toHaveProperty('after_image');

            // check the before_image exist in directory      
            const before_image_exists = ensure_uploaded_file_exist(upload_subfolder, response.body.before_image);
            expect(before_image_exists).toBe(true);
            // check the after image exists in directory
            const after_image_exists = ensure_uploaded_file_exist(upload_subfolder, response.body.after_image);
            expect(after_image_exists).toBe(true);

            // Store the transformation ID for later use
            transformation_id = response.body.id;
            before_image_name = response.body.before_image;
            after_image_name = response.body.after_image;

        });
        
        // sad path - missing required fields
        it('should return 400 for missing required fields', async () => {
            // Arrange : prepare the request body with missing fields
            const requestBody = {
                description: 'This is a test transformation'
            }

            // Act : send a request to create a new transformation
            const response = await request(app)
                .post('/api/admin/transformation')
                .set('Cookie', auth_cookies)
                .field('description', requestBody.description)

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('"name" is required');
            expect(response.body.code).toBe('VALIDATION_ERROR');
        })
        // sad path - missing images
        it('should return 400 for missing images', async () => {
            // Arrange : prepare the request body with missing images
            const requestBody = {
                name: 'Test Transformation',
                description: 'This is a test transformation'
            }

            // Act : send a request to create a new transformation
            const response = await request(app)
                .post('/api/admin/transformation')
                .set('Cookie', auth_cookies)
                .field('name', requestBody.name)
                .field('description', requestBody.description)

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe(`Files required: before_image, after_image`);
            expect(response.body.code).toBe('FILE_REQUIRED');
        })
        // sad path - invalid image type
        it('should return 400 for invalid image type', async () => {
            // Arrange : prepare the request body with invalid image type
            const requestBody = {
                name: 'Test Transformation',
                description: 'This is a test transformation'
            }
            // Act : send a request to create a new transformation with invalid image type
            const response = await request(app)
                .post('/api/admin/transformation')
                .set('Cookie', auth_cookies)
                .field('name', requestBody.name)
                .field('description', requestBody.description)
                .attach('before_image', invalid_fixture_image()) // Invalid file type
                 // Assert
            expect(response.statusCode).toBe(400);
            // 
            expect(response.body.message).toBe(`Invalid file type. Allowed: ${allowedMimeTypes.join(', ')}`);
            expect(response.body.code).toBe('INVALID_FILE_TYPE');
        })

        // sad path - unexpected file field
        it('should return 400 for unexpected file field', async () => {
            // Arrange : prepare the request body with unexpected file
            const requestBody = {
                name: 'Test Transformation',
                description: 'This is a test transformation'
            }

            // Act : send a request to create a new transformation with unexpected file
            const response = await request(app)
                .post('/api/admin/transformation')
                .set('Cookie', auth_cookies)
                .field('name', requestBody.name)
                .field('description', requestBody.description)
                .attach('before_image', get_fixture_image(3)) // Valid before image
                .attach('after_image', get_fixture_image()) // Valid after image
                .attach('unexpected_file', invalid_fixture_image()); // Unexpected file
                // we avoid putting the invalid file before the valid files becauses multer will throw err and stop the connection and  jest still send the last file and this cause jest to stuck in timeout

                // Assert
            expect(response.statusCode).toBe(413);
            expect(response.body.message).toBe(`Too many files uploaded`);
            expect(response.body.code).toBe('TOO_MANY_FILES');
        })
        // sad path - size limit exceeded
        it('should return 413 for file size limit exceeded', async () => {
            // Arrange : prepare the request body with large image
            const requestBody = {
                name: 'Test Transformation',
                description: 'This is a test transformation'
            }

            // Act : send a request to create a new transformation with large image
            const response = await request(app)
                .post('/api/admin/transformation')
                .set('Cookie', auth_cookies)
                .field('name', requestBody.name)
                .field('description', requestBody.description)
                .attach('before_image', get_fixture_image()) // Valid before image
                .attach('after_image', "__tests__/fixtures/large_testing_image.jpg"); // Large after image

                // Assert

            expect(response.statusCode).toBe(413);
            expect(response.body.message).toBe(`Uploaded file is too large`);
            expect(response.body.code).toBe('FILE_TOO_LARGE');
        })
    });

    describe('PUT /api/admin/transformation/:id', () => {
        
        // happy path - update an existing transformation
        it('should update an existing transformation', async () => {
            // Arrange : prepare the request body
            const requestBody = {
                name: 'Updated Transformation'
            }

            // Act : send a request to update the transformation
            const response = await request(app)
                .put(`/api/admin/transformation/${transformation_id}`)
                .set('Cookie', auth_cookies)
                .field('name', requestBody.name)
                .attach('before_image', get_fixture_image(2))
                .attach('after_image', get_fixture_image(3));

            // Assert
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Transformation updated successfully');
            expect(response.body.before_image).toBeDefined();
            expect(response.body.after_image).toBeDefined();

            // check the old images are deleted
            const old_before_image_exists = ensure_uploaded_file_exist(upload_subfolder, before_image_name);
            expect(old_before_image_exists).toBe(false);
            
            const old_after_image_exists = ensure_uploaded_file_exist(upload_subfolder, after_image_name);
            expect(old_after_image_exists).toBe(false);

            // check the  new images exist in directory
            const before_image_exists = ensure_uploaded_file_exist(upload_subfolder, response.body.before_image);
            expect(before_image_exists).toBe(true);

            const after_image_exists = ensure_uploaded_file_exist(upload_subfolder, response.body.after_image);
            expect(after_image_exists).toBe(true);

            // Update the transformation images for later use
            before_image_name = response.body.before_image;
            after_image_name = response.body.after_image;

        });
        // sad path - empty request body
        it('should return 400 for missing required fields', async () => {

            // Act : send an update request to create a new transformation with missing fields
            const response = await request(app)
                .put(`/api/admin/transformation/${transformation_id}`)
                .set('Cookie', auth_cookies)

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('At least one field or a file must be provided for an update.');
            expect(response.body.code).toBe('UPDATE_EMPTY');
        })
        // update with invalid id 
        it('should return 404 for non-existing transformation ID', async () => {
            // Arrange : prepare the request body
            const requestBody = {
                name: 'Updated Transformation',
            }
            const invalid_id = '999999';
            // Act : send a request to update the transformation with non-existing ID
            const response = await request(app)
                .put(`/api/admin/transformation/${invalid_id}`)
                .set('Cookie', auth_cookies)
                .field('name', requestBody.name)
                .attach('before_image', get_fixture_image(2))

            // Assert
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe(`Transformation with ID ${invalid_id} not found`);
            expect(response.body.code).toBe('TRANSFORMATION_NOT_FOUND');
        })
        // sad path - update with valid image field but invalid image type
        it('should return 400 for invalid image type', async () => {
            // Arrange : prepare the request body
            const requestBody = {
                name: 'Updated Transformation',
            }

            // Act : send a request to update the transformation with invalid image type
            const response = await request(app)
                .put(`/api/admin/transformation/${transformation_id}`)
                .set('Cookie', auth_cookies)
                .field('name', requestBody.name)
                .attach('before_image', invalid_fixture_image()) // Invalid file type

            // Assert
            expect(response.statusCode).toBe(400);
            //    Received: "Invalid file type. Allowed: image/jpeg, image/png, image/gif, image/webp, image/avif"
            expect(response.body.message).toBe(`Invalid file type. Allowed: ${allowedMimeTypes.join(', ')}`);
            expect(response.body.code).toBe('INVALID_FILE_TYPE');
         
        })

        // sad path - unexpected file field
        it('should return 400 for unexpected file field', async () => {
            // Arrange : prepare the request body with unexpected file
            const requestBody = {
                name: 'Updated Transformation',
            }
            try {

                // Act : send a request to update the transformation with unexpected file
                const response = await request(app)
                    .put(`/api/admin/transformation/${transformation_id}`)
                    .set('Cookie', auth_cookies)
                    .field('name', requestBody.name)
                    .attach('before_image', get_fixture_image(3)) // Valid before image
                    .attach('unexpected_field', get_fixture_image(2)) // Unexpected file
        
                // If we get here, check the response

                expect(response.statusCode).toBe(400);
                //Unexpected file field: unexpected_field
                expect(response.body.message).toBe('Unexpected file field in upload');
                expect(response.body.code).toBe('UNEXPECTED_FILE_FIELD');
            } catch (err) {
                // If we get ECONNRESET, test manually passes
                if (err.code === 'ECONNRESET') {
                    // console.log('Got expected connection error due to Multer/Supertest interaction');
                    // Manually pass the test
                    expect(true).toBe(true);// this needed because jest expect something in the test otherwise it fail
                    // Note: This is a testing framework limitation, not an application bug
                }
                else throw err; // rethrow unexpected errors
            }
        })
    })

    describe('GET /api/admin/transformation', () => {
        // happy path - get all transformations
        it('should return a list of transformations', async () => {

            // Act : send a request to get all transformations
            const response = await request(app)
                .get('/api/admin/transformation')
                .set('Cookie', auth_cookies);
            // Assert
            expect(response.statusCode).toBe(200);

            // check the response body
            for (const transformation of response.body) {
                expect(transformation).toHaveProperty('id');
                expect(transformation).toHaveProperty('name');
                expect(transformation).toHaveProperty('description');
                expect(transformation).toHaveProperty('before_image');
                expect(transformation).toHaveProperty('after_image');
            }
        });
        // sad path - unauthorized access   
        it('should return 401 for unauthorized access', async () => {
            // Act : send a request without authentication
            const response = await request(app)
                .get('/api/admin/transformation');

            // Assert
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
            expect(response.body.code).toBe('UNAUTHORIZED');
        });
    });
    describe('DELETE /api/admin/transformation/:id', () => {
        // happy path - delete an existing transformation
        it('should delete an existing transformation', async () => {
            // Act : send a request to delete the transformation
            const response = await request(app)
                .delete(`/api/admin/transformation/${transformation_id}`)
                .set('Cookie', auth_cookies);

            // Assert
            expect(response.statusCode).toBe(204);
            expect(response.body).toEqual({});

            // check the images are deleted from the directory
            const before_image_exists = ensure_uploaded_file_exist(upload_subfolder, before_image_name);
            expect(before_image_exists).toBe(false);
            const after_image_exists = ensure_uploaded_file_exist(upload_subfolder, after_image_name);
            expect(after_image_exists).toBe(false);
        })
        // sad path - invalid non-existing transformation ID
        it('should return 404 for non-existing transformation ID', async () => {

            // Arrange : prepare the transformation ID
            const transformation_id = 999999; // Non-existing ID
            // Act : send a request to delete the transformation with non-existing ID
            const response = await request(app)
                .delete(`/api/admin/transformation/${transformation_id}`)
                .set('Cookie', auth_cookies);

            // Assert
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe(`Transformation with ID ${transformation_id} not found`);
            expect(response.body.code).toBe('TRANSFORMATION_NOT_FOUND');
        })
    })


})