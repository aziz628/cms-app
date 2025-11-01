import request from "supertest";
import app from "../../app.js";
import { getAuthCookies,get_fixture_image,ensure_uploaded_file_exist ,invalid_fixture_image,check_no_file_in_uploads} from '../helper/tools.js';
const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"];

// global variables 
const upload_subfolder = "gallery";
// main describe block 
describe("Gallery API", () => {
    // prepare  the variables used across tests
    let authCookies;
    let image_id;
    let image_name;
    let category_id;
    beforeAll(async () =>{
        authCookies = await getAuthCookies();
    });
    // ensure no test fixture files exist in uploads/gallery  before and after the tests
    afterAll(async() => {
            const noFilesExist = check_no_file_in_uploads(upload_subfolder);
            expect(noFilesExist).toBe(true);
        });

    describe("POST /api/gallery", () => {
        // happy path - create a new category
            it('should create a new category', async () => {
                // Arrange: Prepare the category data
                const categoryData = {
                    name: 'Test Category'
                };
                // Act: Create a new category
                const categoryResponse = await request(app)
                    .post('/api/admin/gallery/category')
                    .set('Cookie', authCookies)
                    .send(categoryData);

                // Assert: Check if the category was created successfully
                expect(categoryResponse.statusCode).toBe(201);
                expect(categoryResponse.body.message).toBe('Category added successfully');
                expect(categoryResponse.body.category_id).toBeDefined();
                

                // Store the category ID for later use
                category_id = categoryResponse.body.category_id;
            });
        // sad path - create a duplicate category
            it('should return 400 for duplicate category name', async () => {
                // Arrange: Prepare the category data with a duplicate name
                const categoryData = {
                    name: 'Test Category' // Same name as the previously created category
                };

                // Act: Attempt to create a new category with the duplicate name
                const response = await request(app)
                    .post('/api/admin/gallery/category')
                    .set('Cookie', authCookies)
                    .send(categoryData);

                // Assert: Check if the application correctly handled the error
                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe('Category name must be unique');
                expect(response.body.code).toBe('DUPLICATE_CATEGORY_NAME');
            });
        // sad path - create a category with missing name
            it('should return 400 for missing category name', async () => {
                // Arrange: Prepare the category data with missing name
                const categoryData = {};

                // Act: Attempt to create a new category
                const response = await request(app)
                    .post('/api/admin/gallery/category')
                    .set('Cookie', authCookies)
                    .send(categoryData);

                // Assert: Check if the application correctly handled the error
                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe('"name" is required');
                expect(response.body.code).toBe('VALIDATION_ERROR');
            })
        // happy path - upload an image
            it('should upload an image', async () => {
                // Arrange: Prepare the image file and data
                const imageData = {
                    name: 'Test Image',
                    description: 'Test Image Description'
                };
                // Act: Upload the image
                const response = await request(app)
                    .post(`/api/admin/gallery/${category_id}/image`)
                    .set('Cookie', authCookies)
                    .field('name', imageData.name)
                    .field('description', imageData.description)
                    .attach('image', get_fixture_image());
                //assert if the image was uploaded successfully
                expect(response.statusCode).toBe(201);
                expect(response.body.message).toBe('Image added successfully');
                expect(response.body.image_id).toBeDefined();
                expect(response.body.image_name).toBeDefined();

                // check if the image file exists in the upload directory
                const image_exists = ensure_uploaded_file_exist(upload_subfolder,response.body.image_name);
                expect(image_exists).toBe(true);

                // Store the image ID and name for later use
                image_id = response.body.image_id;
                image_name = response.body.image_name;
            })
            
        // sad path - upload an image with missing fields
            it('should return 400 for missing image fields', async () => {
                // Arrange: Prepare the image data with missing fields
                const imageData = {
                    description: 'Test Image Description'
                };

                // Act: Attempt to upload an image with missing name
                const response = await request(app)
                    .post(`/api/admin/gallery/${category_id}/image`)
                    .set('Cookie', authCookies)
                    .field('description', imageData.description)
                    .attach('image', get_fixture_image());

                // Assert: Check if the application correctly handled the error
                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe('"name" is required');
                expect(response.body.code).toBe('VALIDATION_ERROR');
            })
        // sad path - upload an image without an image file
            it('should return 400 for missing image file', async () => {
                // Arrange: Prepare the image data without an image file
                const imageData = {
                    name: 'Test Image',
                    description: 'Test Image Description'
                };

                // Act: Attempt to upload an image without an image file
                const response = await request(app)
                    .post(`/api/admin/gallery/${category_id}/image`)
                    .set('Cookie', authCookies)
                    .field('name', imageData.name)
                    .field('description', imageData.description);

                // Assert: Check if the application correctly handled the error
                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe('Files required: image');
                expect(response.body.code).toBe('FILE_REQUIRED');
            })
        // sad path - upload an image with non existent category
            it('should return 404 for non-existent category', async () => {
                // Arrange: Prepare the image data
                const imageData = {
                    name: 'Test Image',
                    description: 'Test Image Description'
                };
                const nonExistentCategoryId = 9999; // Assuming this ID does not exist

                // Act: Attempt to upload an image to a non-existent category
                const response = await request(app)
                    .post(`/api/admin/gallery/${nonExistentCategoryId}/image`)
                    .set('Cookie', authCookies)
                    .field('name', imageData.name)
                    .field('description', imageData.description)
                    .attach('image', get_fixture_image());

                // Assert: Check if the application correctly handled the error
                expect(response.statusCode).toBe(404);
                expect(response.body.message).toBe('Category not found');
                expect(response.body.code).toBe('CATEGORY_NOT_FOUND');

                // Check if the image file was deleted
                const deleted_image_exist = ensure_uploaded_file_exist(upload_subfolder,imageData.name);
                expect(deleted_image_exist).toBe(false);
            })
        // sad path - upload an invalid image file
            it('should return 400 for invalid image file', async () => {
                // Arrange: Prepare the image data
                const imageData = {
                    name: 'Test Image',
                    description: 'Test Image Description'
                };
               

                // Act: Attempt to upload an invalid image file
                const response = await request(app)
                    .post(`/api/admin/gallery/${category_id}/image`)
                    .set('Cookie', authCookies)
                    .field('name', imageData.name)
                    .field('description', imageData.description)
                    .attach('image', invalid_fixture_image());

                // Assert: Check if the application correctly handled the error
                expect(response.statusCode).toBe(400);
                // Invalid file type. Allowed: image/jpeg, image/png, image/gif, image/webp, image/avif
                expect(response.body.message).toBe(`Invalid file type. Allowed: ${allowedTypes.join(", ")}`);
                expect(response.body.code).toBe('INVALID_FILE_TYPE');
            })
    });
    describe("GET /api/gallery", () => {
        // happy path - get all gallery images
        it('should return all gallery images', async () => {
            // Act: Make a GET request to the /api/gallery endpoint
            const response = await request(app)
                .get('/api/admin/gallery')
                .set('Cookie', authCookies); // Use the auth cookies for authentication

            // Assert: Check if the response is as expected
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('categories');
            expect(response.body).toHaveProperty('images');
            for (const category of response.body.categories) {
                expect(category).toHaveProperty('id');
                expect(category).toHaveProperty('name');
            }
            for (const image of response.body.images) {
                expect(image).toHaveProperty('id');
                expect(image).toHaveProperty('name');
                expect(image).toHaveProperty('filename');
                expect(image).toHaveProperty('description');
                expect(image).toHaveProperty('category_id');
                expect(image).toHaveProperty('category_name');
            }
        })
        // sad path - unauthorized access
        it('should return 401 for unauthorized access', async () => {
            // Act: Make a GET request to the /api/gallery endpoint without authentication
            const response = await request(app)
                .get('/api/admin/gallery');

            // Assert: Check if the application correctly handled the unauthorized access
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
            expect(response.body.code).toBe('UNAUTHORIZED');
        })
    })
    describe("PUT /api/gallery/", () => {
        // Ensure the image_id, image_name, and category_id are defined before running the tests
        beforeAll(() => {
            expect(image_id).toBeDefined();
            expect(image_name).toBeDefined();
            expect(category_id).toBeDefined();
        })
        // happy path - update a category
        it('should update a category', async () => {
            // Arrange: Prepare the updated category data
            const updatedCategoryData = {
                name: 'Updated Test Category'
            };

            // Act: Make a PUT request to update the category
            const response = await request(app)
                .put(`/api/admin/gallery/category/${category_id}`)
                .set('Cookie', authCookies)
                .send(updatedCategoryData);
            // Assert: Check if the category was updated successfully
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Category updated successfully');

        })
        // sad path - update a non-existent category
        it('should return 404 for non-existent category', async () => {
            // Arrange: Prepare the updated category data
            const updatedCategoryData = {
                name: 'Updated Test Category'
            };
            const nonExistentCategoryId = 9999; // Assuming this ID does not exist

            // Act: Attempt to update a non-existent category
            const response = await request(app)
                .put(`/api/admin/gallery/category/${nonExistentCategoryId}`)
                .set('Cookie', authCookies)
                .send(updatedCategoryData);

            // Assert: Check if the application correctly handled the error
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('Category not found');
            expect(response.body.code).toBe('CATEGORY_NOT_FOUND');
        })
        // sad path - update a category with missing name
        it('should return 400 for missing category name', async () => {
            // Arrange: Prepare the updated category data with missing name
            const updatedCategoryData = {};

            // Act: Attempt to update a category with missing name
            const response = await request(app)
                .put(`/api/admin/gallery/category/${category_id}`)
                .set('Cookie', authCookies)
                .send(updatedCategoryData);

            // Assert: Check if the application correctly handled the error
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('"name" is required');
            expect(response.body.code).toBe('VALIDATION_ERROR');
        })
        // happy path - update an image
        it('should update an image', async () => {
            // Arrange: Prepare the updated image data
            const updatedImageData = {
                name: 'Updated Test Image',
                description: 'Updated Test Image Description'
            };

            // Act: Make a PUT request to update the image
            const response = await request(app)
                .put(`/api/admin/gallery/${category_id}/image/${image_id}`)
                .set('Cookie', authCookies)
                .field('name', updatedImageData.name)
                .field('description', updatedImageData.description)
                .attach('image', get_fixture_image(1));

            // Assert: Check if the image was updated successfully
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Image updated successfully');
            expect(response.body.image_name).toBeDefined();

            // Check if the old image file was deleted
            const old_image_exists = ensure_uploaded_file_exist(upload_subfolder,image_name);
            expect(old_image_exists).toBe(false);

            // Check if the new image file exists in the upload directory
            const updated_image_exists = ensure_uploaded_file_exist(upload_subfolder,response.body.image_name);
            expect(updated_image_exists).toBe(true);

            // update the image_id and image_name for later use
            image_name = response.body.image_name;
        })
        // sad path - update a non-existent image
        it('should return 404 for non existent image', async () => {
            // Arrange: Prepare the updated image data
            const updatedImageData = {
                name: 'Updated Test Image',
                description: 'Updated Test Image Description'
            };
            const non_existent_id_image= 99999  // Assuming this ID does not exist

            // Act : Attempt to update a non-existent image
            const response = await request(app)
                .put(`/api/admin/gallery/${category_id}/image/${non_existent_id_image}`)
                .set("Cookie", authCookies)
                .field('name', updatedImageData.name)
                .field('description', updatedImageData.description);

            // Assert: Check if the application correctly handled the error
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('Image not found');
            expect(response.body.code).toBe('IMAGE_NOT_FOUND');
        })
        // sad path - update an image with no fields
        it('should return 400 for missing image fields', async () => {
            // Arrange: no fields

            // Act: Attempt to update an image with no fields
            const response = await request(app)
                .put(`/api/admin/gallery/${category_id}/image/${image_id}`)
                .set('Cookie', authCookies)
                .send()

            // Assert: Check if the application correctly handled the error
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('At least one field or a file must be provided for an update.');
            expect(response.body.code).toBe('UPDATE_EMPTY');
        })
    })
    describe("DELETE /api/gallery/:image_id", () => {
        // Ensure the image_id and image_name are defined before running the tests
        beforeAll(() => {
            expect(image_id).toBeDefined();
            expect(image_name).toBeDefined();
            expect(category_id).toBeDefined();
        })
        // sad path - delete a non-existent image
        it('should return 404 for non-existent image', async () => {
            // Act: Attempt to delete a non-existent image
            const nonExistentImageId = 9999; // Assuming this ID does not exist
            const response = await request(app)
                .delete(`/api/admin/gallery/${category_id}/image/${nonExistentImageId}`)
                .set('Cookie', authCookies);

            // Assert: Check if the application correctly handled the error
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('Image not found');
            expect(response.body.code).toBe('IMAGE_NOT_FOUND');
        })
        // happy path - delete an image
        it('should delete an image', async () => {
            // arrange: 
            // upload new image then delete it
            const newImageData = {
                name: 'Test Image 2',
                description: 'Test Image Description 2'
            };
            const { body } = await request(app)
                .post(`/api/admin/gallery/${category_id}/image`)
                .set('Cookie', authCookies)
                .field('name', newImageData.name)
                .field('description', newImageData.description)
                .attach('image', "__tests__/fixtures/testing_image.jpg");
            expect(body.message).toBe('Image added successfully');
            expect(body.image_id).toBeDefined();
            const newImageId = body.image_id;
            const newImageName = body.image_name;

            // Act: Make a DELETE request to delete the image
            const response = await request(app)
                .delete(`/api/admin/gallery/${category_id}/image/${newImageId}`)
                .set('Cookie', authCookies);

            // Assert: Check if the image was deleted successfully
            expect(response.statusCode).toBe(204);

            // Check if the image file was deleted from the upload directory
            const deleted_image_exists = ensure_uploaded_file_exist(upload_subfolder,newImageName);
            expect(deleted_image_exists).toBe(false);
        })

        // happy path - delete a category
        it('should delete a category', async () => {
            // Act: Make a DELETE request to delete the category
            const response = await request(app)
                .delete(`/api/admin/gallery/category/${category_id}`)
                .set('Cookie', authCookies);

            // Assert: Check if the category was deleted successfully
            expect(response.statusCode).toBe(204);

            // temporarily test for category deletion , better option in future
            // Check if the category was removed from the database
            const categoryResponse = await request(app)
                .get('/api/admin/gallery')
                .set('Cookie', authCookies);
            const categoryExists = categoryResponse.body.categories.some(cat => cat.id === category_id);
            expect(categoryExists).toBe(false);

            // check if image of the category was deleted
            const deleted_image_exists = ensure_uploaded_file_exist(upload_subfolder,image_name);
            expect(deleted_image_exists).toBe(false);
        })
        
        // sad path - delete a non-existent category
        it('should return 404 for non-existent category', async () => {
            // Act: Attempt to delete a non-existent category
            const nonExistentCategoryId = 9999; // Assuming this ID does not exist
            const response = await request(app)
                .delete(`/api/admin/gallery/category/${nonExistentCategoryId}`)
                .set('Cookie', authCookies);

            // Assert: Check if the application correctly handled the error
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('Category not found');
            expect(response.body.code).toBe('CATEGORY_NOT_FOUND');
        })
    })
});