import request from 'supertest';
import app from "../../app.js"; 
import { getAuthCookies,get_fixture_image,ensure_uploaded_file_exist ,invalid_fixture_image,check_no_file_in_uploads} from '../helper/tools.js';

const upload_subfolder = 'events'; // upload_subfolder in uploads directory for event images

describe("Event api",() => {
    // test vars 
    let authCookies;
    let testEventId;
    let imageName; // returned image name from the create event response needed for delete test 

    // Setup : login before all tests to get auth cookies
    beforeAll(async () => {
        authCookies = await getAuthCookies();
    })
afterAll(async() => {
        const noFilesExist = check_no_file_in_uploads(upload_subfolder);
        expect(noFilesExist).toBe(true);
    });

    describe('Get /events', () => {
        // get all events
        it('should return all events in body and status code 200', async () => {
            // no addional arrange needed
            
            // act
            const response = await request(app)
                .get('/api/admin/events')
                .set('Cookie', authCookies); // Use the auth cookies for authentication
            
            // assert 
            expect(response.statusCode).toBe(200);
            expect(response.body).toBeDefined();
            // body is an object 
            expect(typeof response.body).toBe('object');

            for (const event of response.body) {
                expect(event.id).toBeDefined();
                expect(event.title).toBeDefined();
                expect(event.date).toBeDefined();
                expect(event.location).toBeDefined();
                expect(event.image).toBeDefined(); // Check if image is present
            }
        });

        // sad path - get all events without auth
        it('should return 401 for unauthorized access to all events', async () => {
            // act
            const response = await request(app)
                .get('/api/admin/events'); // No auth cookies provided

            // assert
            expect(response.statusCode).toBe(401);
            expect(response.body).toBeDefined();
            expect(response.body.message).toBe("Unauthorized");
            expect(response.body.code).toBe("UNAUTHORIZED");
        });

    })

    describe('POST /events', () => {
        // happy path - create event
        it('should create an event and return an 201 status code',async ()=>{
            // arrange
            const newEvent = {
                title: 'Test Event',
                description: 'This is a test event',
                date: Date.now(),
                location: 'Test Location'
            };

            // act
            const response = await request(app)
                .post('/api/admin/events')
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .field('title',newEvent.title)
                .field("description",newEvent.description)
                .field("date",newEvent.date)
                .field("location",newEvent.location)
                .attach('image', get_fixture_image()) ; // Attach an image file

            // assert
            expect(response.statusCode).toBe(201);
            expect(response.body).toBeDefined();
            expect(response.body.message).toBe("Event created successfully");    
            expect(response.body.image).toBeDefined();    
            expect(typeof response.body.id).toBe('number');


            // check if the uploaded image added to the uploads directory
            const imageExists = ensure_uploaded_file_exist(upload_subfolder, response.body.image);
            expect(imageExists).toBe(true);

            testEventId = response.body.id;// Save the ID for later tests
            imageName = response.body.image; // Save the image name for later tests
        })
            
        // sad path - create event without auth credentials
        it('should return 401 for unauthorized event creation', async () => {
            // arrange
            const newEvent = {
                title: 'Unauthorized Event',
                description: 'This event should not be created',
                date: Date.now(),
                location: 'Unauthorized Location'
            };

            // act
            const response = await request(app)
                .post('/api/admin/events')
                .send(newEvent); // No auth cookies provided

            // assert
            expect(response.statusCode).toBe(401);
            expect(response.body).toBeDefined();
            expect(response.body.message).toBe("Unauthorized");
            expect(response.body.code).toBe("UNAUTHORIZED");
        })
        // sad path - create event with missing fields
        it('should return 400 for missing required fields from joi validation', async () => {
            // arrange
            const newEvent = {
                title: 'Incomplete Event',
                // Missing description, date, and location
            };
            // act
            const response = await request(app)
                .post('/api/admin/events')
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .send(newEvent);

            // assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toBeDefined();
            // example of joi error : "\"date\" is required"
            expect(response.body.message).toMatch(/"date" is required/);
            expect(response.body.code).toBe('VALIDATION_ERROR');
        });

        // sad path - create event with missing image from file validator 
        it("it should return 400 for missing image file",async ()=>{
            // arrange
            const newEvent = {
                title: 'Event Without Image',
                date: Date.now(),
                location: 'No Image Location'
            };
            // act
            const response = await request(app)
                .post('/api/admin/events')
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .field('title', newEvent.title)
                .field('date', newEvent.date)
                .field('location', newEvent.location);
            // assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toBeDefined();
            expect(response.body.message).toBe("Files required: image");
            expect(response.body.code).toBe("FILE_REQUIRED");
        })
        // sad path - create event with invalid file type
        it("should return 400 for invalid file type", async () => {
            // arrange 
            const newEvent = {
                title: 'Invalid File Type Event',
                description: 'This event has an invalid image file type',
                date: Date.now(),
                location: 'Invalid File Location'
            };
            const allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']; // Allowed file types

            // act
            const response = await request(app)
                .post('/api/admin/events')
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .field('title', newEvent.title)
                .field('description', newEvent.description)
                .field('date', newEvent.date)
                .field('location', newEvent.location)
                .attach('image', invalid_fixture_image()); // Attach an invalid file type

            // assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toBeDefined();
            expect(response.body.message).toBe(`Invalid file type. Allowed: ${allowedFileTypes.join(', ')}`);
            expect(response.body.code).toBe("INVALID_FILE_TYPE");

        })

    })
    
    describe('PUT /events/:id', () => {
        // sad path - update event with missing fields
        it('should return 400 for missing required fields during event update', async () => {
            // arrange
            expect(testEventId).toBeDefined(); // Ensure testEventId is set from previous tests
            // Missing body fields

            // act
            const response = await request(app)
                .put(`/api/admin/events/${testEventId}`)
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .send();

            // assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toBeDefined();
            expect(response.body.message).toBe("At least one field or a file must be provided for an update.");
            expect(response.body.code).toBe("UPDATE_EMPTY");
        });

        // happy path update event
        it('should update an event and return a 200 status code', async () => {
            
            // arrange
            
            expect(testEventId).toBeDefined(); // Ensure testEventId is set from previous tests
            const updatedEvent = {
                title: 'Updated Test Event',
                description: 'This is an updated test event',
                date: Date.now(),
                location: 'Updated Test Location'
            };

            // act
            const response = await request(app)
                .put(`/api/admin/events/${testEventId}`)
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .send(updatedEvent);

            // assert
            expect(response.statusCode).toBe(200);
            expect(response.body).toBeDefined();
            expect(response.body.message).toBe("Event updated successfully");
            expect(response.body.image).toBeUndefined(); // No image update in this test
        });

        // sad path - update event with invalid id
        it('should return 404 for updating an event with an invalid ID', async () => {
            // arrange
            const invalidEventId = 999999; // Assuming this ID does not exist

            
            // act
            const response = await request(app)
                .put(`/api/admin/events/${invalidEventId}`)
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .attach('image', get_fixture_image(1)) // Attach an image file

            // assert
            expect(response.statusCode).toBe(404);
            expect(response.body).toBeDefined();
            expect(response.body.message).toBe(`Event with ID ${invalidEventId} not found`);
            expect(response.body.code).toBe("EVENT_NOT_FOUND");

           
        });

        // happy event - update event with image
        it('should update an event with an image and return a 200 status code', async () => {
            // arrange  
            expect(testEventId).toBeDefined(); // Ensure testEventId is set from previous tests
            

            // act
            const response = await request(app)
                .put(`/api/admin/events/${testEventId}`)
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .attach('image', get_fixture_image(1)); // Attach the updated image file

            // assert
            expect(response.statusCode).toBe(200);
            expect(response.body).toBeDefined();
            expect(response.body.message).toBe("Event updated successfully");
            expect(response.body.image).toBeDefined();
            
            // check if the old image is deleted from the uploads directory
            const old_image_exists = ensure_uploaded_file_exist(upload_subfolder, imageName);
            expect(old_image_exists).toBe(false);

            // check if the new image is added to the uploads directory
            const new_image_exists = ensure_uploaded_file_exist(upload_subfolder, response.body.image);
            expect(new_image_exists).toBe(true);

            // Update the imageName for future tests
            imageName = response.body.image; // Update the image name for future tests
        });
        // sad path - update event with invalid file type
        it('should return 400 for invalid file type during event update', async () => {
            // arrange
            expect(testEventId).toBeDefined(); // Ensure testEventId is set from previous tests
            const allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']; // Allowed file types

            // act
            const response = await request(app)
                .put(`/api/admin/events/${testEventId}`)
                .set('Cookie', authCookies) // Use the auth cookies for authentication
                .attach('image', invalid_fixture_image()); // Attach an invalid file type

            // assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toBeDefined();
            expect(response.body.message).toBe(`Invalid file type. Allowed: ${allowedFileTypes.join(', ')}`);
            expect(response.body.code).toBe("INVALID_FILE_TYPE");
        });

    });
    
    describe('DELETE /events/:id', () => {

        // happy path delete event
        it('should delete an event and return a 204 status code', async () => {
            // arrange
            // Ensure testEventId is defined from previous tests
            expect(testEventId).toBeDefined();

            // act
            const response = await request(app)
                .delete(`/api/admin/events/${testEventId}`)
                .set('Cookie', authCookies); // Use the auth cookies for authentication

            // assert
            expect(response.statusCode).toBe(204);
            // No content expected in the response body
            expect(response.body).toEqual({});
            // toBe() is for strict equality (same reference), while toEqual() is for value equality (same content).
            
            // Check if the event image was deleted
            const image_exists = ensure_uploaded_file_exist(upload_subfolder, imageName);
            expect(image_exists).toBe(false);

        });

        // sad path - delete event of invalid id
        it('should return 404 for deleting an event with an invalid ID', async () => {
            // arrange
            const invalidEventId = 999999; // Assuming this ID does not exist

            // act
            const response = await request(app)
                .delete(`/api/admin/events/${invalidEventId}`)
                .set('Cookie', authCookies); // Use the auth cookies for authentication

            // assert
            expect(response.statusCode).toBe(404);
            expect(response.body).toBeDefined();
            expect(response.body.message).toBe(`Event with ID ${invalidEventId} not found`);
            expect(response.body.code).toBe("EVENT_NOT_FOUND");
        });
    })
});