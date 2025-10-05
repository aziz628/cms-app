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
        // save how much there is pages before running this test and see how much there is on last page
        let pages_number;
        let last_page_logs_number;
        let total_logs;
        // do some requests to create more than 10 log entries
        let categories_list=[]
        
        // check first page is 10 
            const response = await request(app)
                .get('/api/admin/dashboard?page=1')
                .set('Cookie', authCookies);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('logs');
        expect(response.body).toHaveProperty('totalPages');
        expect(Array.isArray(response.body.logs)).toBe(true);
        
        // set numbers 
        pages_number=response.body.totalPages
        last_page_logs_number=response.body.logs.length;
        total_logs=(pages_number-1)*10+last_page_logs_number;
        
        // create logs 
        for (let i = 0; i < 15; i++) {
            // Create a new category
            const categoryResponse = await request(app)
                    .post('/api/admin/gallery/category')
                    .set('Cookie', authCookies)
                    .send({name: `Test Category ${i}`}); // randomly generated name
            if(categoryResponse.body.category_id)
            categories_list.push(categoryResponse.body.category_id);
            total_logs+=1;
        }
        // calc new value
        pages_number=Math.floor(total_logs / 10)+(total_logs % 10 >0 ? 1 :0)

        // Check second page
        const response2 = await request(app)
            .get(`/api/admin/dashboard?page=${pages_number}`)
            .set('Cookie', authCookies);
        expect(response2.statusCode).toBe(200);
        expect(response2.body).toHaveProperty('logs');
        expect(response2.body).toHaveProperty('totalPages');
        // the expected number of total pages should be total/10+total%10
        expect(response2.body.totalPages).toBeGreaterThanOrEqual(pages_number);
        expect(response2.body.logs.length).toBeGreaterThanOrEqual(total_logs % 10);
        // delete all the categories
        for (const category_id of categories_list) {
            let response = await request(app)
                .delete(`/api/admin/gallery/category/${category_id}`)
                .set('Cookie', authCookies);
            expect(response.statusCode).toBe(204)
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
