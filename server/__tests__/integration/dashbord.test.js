import request from 'supertest';
import app from '../../app.js';
import {getAuthCookies} from '../helper/tools.js';



describe('Dashboard Integration Tests', () => {
    let authCookies;
    beforeAll(async () => {
        authCookies = await getAuthCookies();
    });
   // happy path - get dashboard data  with <=10 entries 
    it('should return the list of admin actions as logs', async () => {
        const response = await request(app)
            .get('/api/admin/dashboard')
            .set('Cookie', authCookies);

        expect(response.statusCode).toBe(200);
        // Check that the response body is an array
        expect(Array.isArray(response.body.logs)).toBe(true);
        expect(response.body.totalPages).toBeDefined();

        for (const logEntry of response.body.logs) {
            expect(logEntry).toHaveProperty('action');
            expect(logEntry).toHaveProperty('timestamp');
            expect(logEntry).toHaveProperty('icon');
        }
        
    });
    // happy path - pagination
    it('should return paginated admin actions logs', async () => {
        // save number of pages before running the test
        // save logs count from last page
        let pages_count;
        let last_page_logs_number;
        let total_logs;

        // do multiple requests to create more than 10 log entries
        let categories_list=[]
        
        // get the first page logs to save initial numbers
        const response = await request(app)
                .get('/api/admin/dashboard?page=1')
                .set('Cookie', authCookies);

        // Check response
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('logs');
        expect(response.body).toHaveProperty('totalPages');
        expect(Array.isArray(response.body.logs)).toBe(true);

        // set the pagination info
        pages_count = response.body.totalPages;

        // get last page logs number
        const response_2=await request(app)
                .get(`/api/admin/dashboard?page=${Math.max(pages_count, 1)}`)
                .set('Cookie', authCookies);

        last_page_logs_number = response_2.body.logs.length;
        // calculate total logs 
        total_logs = pages_count > 0 
            ? (pages_count - 1) * 10 + last_page_logs_number 
            : 0;

        // create logs 
        for (let i = 0; i < 15; i++) {
            // Create a new category
            const categoryResponse = await request(app)
                    .post('/api/admin/gallery/category')
                    .set('Cookie', authCookies)
                    .send({name: `Test Category ${i}`}); // pseudo name
            
            // Check category creation response
            if (categoryResponse.body.category_id) {
                categories_list.push(categoryResponse.body.category_id);
                total_logs += 1;
            }
        }
        // calc new value based on created logs
        pages_count = Math.floor(total_logs / 10) + (total_logs % 10 > 0 ? 1 : 0);

        // Check second page
        const response3 = await request(app)
            .get(`/api/admin/dashboard?page=${pages_count}`)
            .set('Cookie', authCookies);

        expect(response3.statusCode).toBe(200);
        expect(response3.body).toHaveProperty('logs');
        expect(response3.body).toHaveProperty('totalPages');

        // the expected number of total pages should be total/10+total%10
        expect(response3.body.totalPages).toBeGreaterThanOrEqual(pages_count);
        expect(response3.body.logs.length).toBeGreaterThanOrEqual(total_logs % 10);

        // delete all the categories
        for (const category_id of categories_list) {
            let response = await request(app)
                .delete(`/api/admin/gallery/category/${category_id}`)
                .set('Cookie', authCookies);

            expect(response.statusCode).toBe(204);
        }
    });
    // sad path - unauthorized access
    it('should return 401 Unauthorized when no auth cookies are provided', async () => {
        const response = await request(app)
            .get('/api/admin/dashboard');

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
        expect(response.body.code).toBe('UNAUTHORIZED');
    });
});
