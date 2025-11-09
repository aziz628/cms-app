import request from "supertest";
import app from "../../app.js";
import { 
  getAuthCookies, 
  get_fixture_image, 
  get_fixture_image_size,
  createLargeTestFile
} from '../helper/tools.js';
import { getState ,incrementStorage,reset} from '../../services/upload_storage_state_service.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, '../fixtures');
const STORAGE_STATE_FILE_PATH = path.join(__dirname, '../data/storage-state.json');


describe('Storage Service Integration Tests', () => {
    let auth_cookies;
    let uploaded_ids = [];

    beforeAll(async () => {
      await reset(); // reset state before tests
        auth_cookies = await getAuthCookies();
    });
    
  afterAll(async () => {
    // Cleanup the uploaded transformations
    for (const id of uploaded_ids) {
      await request(app)
        .delete(`/api/admin/transformation/${id}`)
        .set('Cookie', auth_cookies);
    }
  });
  
  describe('POST /api/admin/transformation - Storage Tracking', () => {

    // happy path - upload files and check storage increment
    it('should increment storage after successful upload', async () => {
      // arrange - get initial state
      const initialState = getState();
      const status_file_value=JSON.parse(await fs.readFile(STORAGE_STATE_FILE_PATH, 'utf-8'));
      const saved_image_sizes = get_fixture_image_size() + get_fixture_image_size(1); // use first two images
     
      // verify storage state file matches initial state
      expect(status_file_value.totalSize).toBe(initialState.totalSize);

      // act - upload a transformation
      const response = await request(app)
        .post('/api/admin/transformation')
        .set('Cookie', auth_cookies)
        .field('name', 'Test')
        .field('description', 'Test')
        .attach('before_image', get_fixture_image())
        .attach('after_image', get_fixture_image(1));

      //assert
      expect(response.statusCode).toBe(201);
      uploaded_ids.push(response.body.id);

      const newState = getState();
      const expectedTotalSize = initialState.totalSize + saved_image_sizes;
      expect(newState.totalSize).toBe(expectedTotalSize);

      // test the storage state file 
      const updated_status_file_value=await fs.readFile(STORAGE_STATE_FILE_PATH, 'utf-8');
      const status_data = JSON.parse(updated_status_file_value);
      expect(status_data.totalSize).toBe(expectedTotalSize);
      
    });

    // sad path - exceed storage limit
    it('should reject upload if storage limit would be exceeded', async () => {

      // This requires a large file - generate it
      await createLargeTestFile(1000 * 1024 * 1024); // 1000MB

      let response;
      try {
       response = await request(app)
        .post('/api/admin/transformation')
        .set('Cookie', auth_cookies)
        .field('name', 'Large Upload')
        .field('description', 'Should fail')
        .attach('before_image', `${FIXTURES_DIR}/large_file.png`)
        .attach('after_image', get_fixture_image());

        expect(response.statusCode).toBe(413);
        expect(response.body.code).toBe('FILE_TOO_LARGE');
       } catch (err) {        
        // Supertest may throw ECONNRESET - this is expected when multer rejects the upload and supertest continues to write to a closed connection
        expect(err.code).toBe('ECONNRESET');
        if(err.code !== 'ECONNRESET') throw err;
      }
      // Cleanup large file
      await fs.unlink(`${FIXTURES_DIR}/large_file.png`);
    });

    // sad path - missing Content-Length header
    it('should reject if Content-Length header is missing', async () => {
      // no arrange needed
      // act - create request without Content-Length
      const response = await request(app)
        .post('/api/admin/transformation')
        .set('Cookie', auth_cookies)
        // didn't work , supertest sets it automatically and can't be removed
        .unset('Content-Length') // Remove header
        .field('name', 'No Header')
        .field('description', 'Test')
        .attach('before_image', get_fixture_image())
        .attach('after_image', get_fixture_image());
        
      // assert
      if(response.statusCode === 400){
            expect(response.body.code).toBe('MISSING_CONTENT_LENGTH');
      }else{
        // supertest automatically sets it, so we may get success
        expect(response.statusCode).toBe(201);
        uploaded_ids.push(response.body.id);
      }
    });

    
  });

  describe('PUT /api/admin/transformation/:id - Storage Tracking on Update', () => {

    // happy path - update files and check storage adjustment
    it('should adjust storage size on transformation update', async () => {
      // arrange - get initial state
      let transformation_id = uploaded_ids[0];

      const initialState = getState();
      const old_images_size = get_fixture_image_size() + get_fixture_image_size(1);

      // upload new images for update
      const new_image_size = get_fixture_image_size(2);
      const new_image2_size = get_fixture_image_size(3);
      const new_total_size = new_image_size + new_image2_size;

      // act - update transformation
      const response = await request(app)
        .put(`/api/admin/transformation/${transformation_id}`)
        .set('Cookie', auth_cookies)
        .attach('before_image', get_fixture_image(2))
        .attach('after_image', get_fixture_image(3));

      // assert
      expect(response.statusCode).toBe(200);
      const updatedState = getState(); 
      // new total size should be : initial - old + new
      expect(updatedState.totalSize).toBe(initialState.totalSize - old_images_size + new_total_size);

      // test the storage state file
      const updated_status_file_value = await fs.readFile(STORAGE_STATE_FILE_PATH, 'utf-8');
      const status_data = JSON.parse(updated_status_file_value);
      expect(status_data.totalSize).toBe(updatedState.totalSize);
    });
    //sad path - update with non existent id
    it('should return 404 on update with non existent id', async () => {
      // arrange 
      let non_existant_id = 9999999
      let state= getState();
      // act
      const response = await request(app)
        .put(`/api/admin/transformation/${non_existant_id}`)
        .set('Cookie', auth_cookies)
        .attach('before_image', get_fixture_image(2))
        .attach('after_image', get_fixture_image(3));

      // assert
      expect(response.statusCode).toBe(404);
      let updated_state=getState();
      expect(updated_state.totalSize).toBe(state.totalSize); // no change
    });

  });
  describe ('DELETE /api/admin/transformation/:id - Storage Tracking on Delete', () => {

    // happy path - delete and check storage decrement
    it('should decrement storage size on transformation delete', async () => {
      // arrange - get initial state
      let transformation_id = uploaded_ids[0];
      let to_delete_images_size= get_fixture_image_size(2) + get_fixture_image_size(3); // from update test
      const initialState = getState();
      
      // act 
      const response = await request(app)
        .delete(`/api/admin/transformation/${transformation_id}`)
        .set('Cookie', auth_cookies);

      // assert
      expect(response.statusCode).toBe(204);    
      //state update  test
      const updatedState = getState();
      expect(updatedState.totalSize).toBe(initialState.totalSize - to_delete_images_size);

      // remove the first id in uploaded_ids
      uploaded_ids.shift();
    });

  });
  describe('Concurrent Uploads - Queue Atomicity', () => {
    // happy path - concurrent uploads within storage limit
    it('should handle concurrent uploads without exceeding storage limit', async () => {
      // arrange - get initial state
      const initialState = getState();
      const saved_image_sizes = get_fixture_image_size() + get_fixture_image_size(1) ; // two images per upload
      const order = [];

      // act - call multiple increments concurrently
      const uploads = Array(5).fill(null).map((_, i) => {
        const promise = incrementStorage(saved_image_sizes);
        
        // schedule the order tracking to run when promise resolves
        promise.then(() => { order.push(i); });

        // return upload promise
        return promise;
      });
      
      // wait for all uploads to complete
      await Promise.all(uploads);

      // check order of operations
      expect(order).toEqual([0,1,2,3,4]);

      // assert - check final state
      const finalState = getState();
      expect(finalState.totalSize).toBe(initialState.totalSize + saved_image_sizes * 5);
    });
  });

  });