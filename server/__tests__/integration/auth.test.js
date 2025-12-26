import request from 'supertest';
import app from '../../app.js';
import {generateTokens} from '../../services/token_service.js';
import { getAuthCookies} from '../helper/tools.js';
import { get_current_session_id } from '../../services/session_store.js';

import jwt from 'jsonwebtoken';
const ADMIN_USERNAME= process.env.ADMIN_USERNAME || "admin"
const ADMIN_PASSWORD= process.env.ADMIN_PASSWORD || "admin_password"
const JWT_ACCESS_SECRET= process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET= process.env.JWT_REFRESH_SECRET;

  describe('Auth Api', ()=>{  
  let auth_cookies;
  let updated_username;
  let updated_password;

  beforeAll(async ()=>{
    // get the cookies
    auth_cookies = await getAuthCookies();
  });

  // reset the credentials for consistent sequential testing
  afterAll(async ()=>{    
    // get new auth cookies
    auth_cookies = await getAuthCookies({username:updated_username, password:updated_password});

    // act
    const response = await request(app)
          .post('/api/auth/username_update')
            .set('Cookie', auth_cookies)
            .send({ new_username:ADMIN_USERNAME})
    

    const response2 = await request(app)
          .post('/api/auth/password_update')
            .set('Cookie', auth_cookies)
            .send({ new_password:ADMIN_PASSWORD})

    // assert
    expect(response.statusCode).toBe(200)
    expect(response.body.message).toBe('Username updated successfully')
    expect(response2.statusCode).toBe(200)
    expect(response2.body.message).toBe('Password updated successfully')

  })
  
// happy path - return user object when provided valid tokens
it('should return user object when provided valid tokens', async () => {
  
  // act
  const response = await request(app)
    .get('/api/auth/me')
    .set('Cookie', auth_cookies);

  // assert
  expect(response.statusCode).toBe(200);
  expect(response.body).toBeDefined();
  expect(response.body.username).toBe(ADMIN_USERNAME);
});

// -- login tests --

    //  happy path - a successful login.
  it('should return 200 on successful login with correct credentials', async () => {
        //  ARRANGE
        // login credentials. We will use the default admin credentials
        const credentials = {
          username: 'admin',
          password: 'admin_password'
        };

        // ACT

      const response = await  request(app)    
      .post('/api/auth/login')
      .send(credentials);

      // ASSERT
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.message).toBe('Login successful');

      // access and refresh tokens should be set in the response cookies 
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'].length).toBeGreaterThan(0);
      expect(response.headers['set-cookie'][0]).toMatch(/access_token/);
      expect(response.headers['set-cookie'][1]).toMatch(/refresh_token/);

      // overwrite the cookies with new valid tokens 
      auth_cookies=response.headers['set-cookie']

    });
    
    // sad path - incorrect password 
  it('should return 401 for an incorrect password', async () => {
      // ARRANGE
      // Set up credentials with a deliberately wrong password.
      const credentials = {
        username: 'admin',
        password: 'wrong_password'
      };
  
    //ACT
    // Make the same request to the login endpoint.
    const response = await request(app)
            .post("/api/auth/login")
            .send(credentials);

    //  ASSERT
    // Check that the application correctly handled the failure.
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Invalid password'); // Or whatever your actual error message is
    expect(response.body.code).toBe('INVALID_PASSWORD');
  });

  //  sad path - incorrect username  
  it('should return 401 for an incorrect username', async () => {
    //arrange
    const credentials = {
        username: 'wrong_username',
        password: 'admin_password'
    };

    //act 
    const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
    //assert
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Invalid username');
    expect(response.body.code).toBe('INVALID_USERNAME');
  });
  
  // sad path - missing credentials
  it('should return 400 for missing credentials', async () => {
    // Arrange: Set up an empty credentials object
    const credentials = {};
    // Act: Perform login with missing credentials
    const response = await request(app)
        .post('/api/auth/login')
        .send(credentials);

    // Assert: Check if the application correctly handled the missing credentials
    
    expect(response.statusCode).toBe(400);
    // api return only one error  
    expect(response.body.message).toMatch("\"username\" is required");
    expect(response.body.code).toBe('VALIDATION_ERROR');
  })

    // -- update username and password tests --

    // sad path - change username to invalid username
    it('should return 400 for invalid new username',async ()=>{
      // arrange
      const new_username="ab" // too short
      // act 
      const response = await request(app)
            .post('/api/auth/username_update')
              .set('Cookie', auth_cookies)
            .send({new_username});
      // assert 
      expect(response.statusCode).toBe(400)
      expect(response.body.message).toMatch(/"new_username" must be at least 3 chars/)
      expect(response.body.code).toBe('VALIDATION_ERROR')
    })
    // happy path - change username
    it('should update the username ',async ()=>{

      // arrange 
      const new_username="admin_user"
      const credentials= {
        username:new_username,
        password:"admin_password"
      }
      // act 
      const response = await request(app)
            .post('/api/auth/username_update')
              .set('Cookie', auth_cookies)
            .send({new_username});
            
      // assert 
      expect(response.statusCode).toBe(200)
      expect(response.body.message).toBe('Username updated successfully')

      // check if it's updated
      const response2=await request(app)
          .post('/api/auth/login')
          .send(credentials)
      
      expect(response2.statusCode).toBe(200);
      expect(response2.body.message).toBe('Login successful');

      // overwrite the cookies with new valid tokens
      auth_cookies=response2.headers['set-cookie']
      updated_username=new_username

    })

    // sad path - change password with too short password
    it('should return 400 for too short new password',async ()=>{
      // arrange
      const new_password="short"
      // act 
      const response = await request(app)
            .post('/api/auth/password_update')
              .set('Cookie', auth_cookies)
            .send({new_password});
      // assert 
      expect(response.statusCode).toBe(400)
      expect(response.body.message).toMatch(/"new_password" must be at least 8 chars/)
      expect(response.body.code).toBe('VALIDATION_ERROR')
    })

    // happy path - update password 
    it('should update the password',async ()=>{

      // arrange 
      const new_password="admin_pass"
      const credentials= {
        username:updated_username,
        password:new_password
      }
      // act 
      const response = await request(app)
            .post('/api/auth/password_update')
              .set('Cookie', auth_cookies)
            .send({new_password});
      // assert 
      expect(response.statusCode).toBe(200)
      expect(response.body.message).toBe('Password updated successfully')

      // check if it's updated
      const response2=await request(app)
          .post('/api/auth/login')
          .send(credentials)
      
        expect(response2.statusCode).toBe(200);
        expect(response2.body.message).toBe('Login successful');

        // overwrite the cookies with new valid tokens
        auth_cookies=response2.headers['set-cookie']
        
        updated_password=new_password
      })

    // -- token tests --
    // get session expired by  using one second lifespan tokens
    it("should return 401 for expired refresh token", async () => {
      // arrange
      let session_id = await get_current_session_id();
      const {access_token, refresh_token} = generateTokens({
        access_token_lifespan: 1, refresh_token_lifespan: 1, session_id
      }) // tokens expire in 1 second
      
      // wait for 1+ second to ensure the token is expired
      await new Promise(resolve => setTimeout(resolve, 1200)); // wait for 1.2 seconds
      
      // act
      const response = await request(app)
        .post('/api/auth/password_update')
        .set('Cookie', [`access_token=${access_token}`, `refresh_token=${refresh_token}`])
        .send();

      // assert
      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('Session expired. Please log in again.');
      expect(response.body.code).toBe('SESSION_EXPIRED');

    })
    
    // get success request short access and long  refreshed tokens
    it("should rotate tokens when access token is expired and refresh_token is valid", async () => {
      // arrange
      
      let session_id = await get_current_session_id();
      // 1s lifespan access token, 1h lifespan refresh token
      const {access_token, refresh_token} = generateTokens({
        access_token_lifespan: 1, refresh_token_lifespan: 60*60, session_id
      });

      // wait for 1+ second to ensure the access token is expired
      await new Promise(resolve => setTimeout(resolve, 1200)); // wait for 1.2 seconds

      // act
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`access_token=${access_token}`, `refresh_token=${refresh_token}`])
        .send();

      // assert
      expect(response.statusCode).toBe(200);
      expect(response.body.username).toBe(updated_username);

      // new tokens should be set in the response cookies 
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toMatch(/access_token/);
      expect(response.headers['set-cookie'][1]).toMatch(/refresh_token/);

      // helper functions to extract cookies
      let find_cookie = cookieName => response.headers['set-cookie'].find(cookie => cookie.startsWith(`${cookieName}=`));
      let parse_cookies = cookieString => cookieString.split(';')[0].split('=')[1];
      
      // get new tokens from cookies
      const new_access_token = parse_cookies(find_cookie('access_token'));
      const new_refresh_token = parse_cookies(find_cookie('refresh_token'));
      
      // decode tokens
      const decoded_access = jwt.verify(new_access_token, JWT_ACCESS_SECRET);
      const decoded_refresh = jwt.verify(new_refresh_token, JWT_REFRESH_SECRET);

      // compare session IDs to ensure they match the original session ID
      expect(decoded_access.session_id).toBe(session_id);
      expect(decoded_refresh.session_id).toBe(session_id);
    })

    // do two consecutive logins and ensure the session ID is updated
    it("should receive session invalid for second login attempt", async () => {
      // arrange
      const credentials = {
        username: updated_username,
        password: updated_password
      };

      // act
      const response1 = await request(app)
        .post('/api/auth/login')
        .send(credentials);
        
      expect(response1.statusCode).toBe(200);

      // save cookies from first login
      const first_login_cookies = response1.headers['set-cookie'];

      const response2 = await request(app)
        .post('/api/auth/login')
        .send(credentials);
      expect(response2.statusCode).toBe(200);

      // try /me endpoint with first login cookies - should be session invalid
      const response3 = await request(app)
        .get('/api/auth/me')
        .set('Cookie', first_login_cookies)
        .send();
        
      // updated auth cookies for next tests
      auth_cookies = response2.headers['set-cookie'];

      // assert
      expect(response3.statusCode).toBe(401);
      expect(response3.body.message).toBe('Session invalid');
      expect(response3.body.code).toBe('SESSION_INVALID');
    });

    // happy path - logout
    it('should logout the user',async ()=>{

      // act 
      const response = await request(app)
            .post('/api/auth/logout')
            .set('Cookie', auth_cookies)

      // assert 
      expect(response.statusCode).toBe(200)
      expect(response.body.message).toBe('Logout successful')

    })

    // sad path - logout without being logged in
    it('should return 401 when trying to logout without being logged in',async ()=>{
      // act 
      const response = await request(app)
            .post('/api/auth/logout')
            .send();

      // assert 
      expect(response.statusCode).toBe(401)
      expect(response.body.message).toBe('Unauthorized')
      expect(response.body.code).toBe('UNAUTHORIZED')
    })

  // sad path unauthorized 
    it('should return status code 401 for unauthorized access', async () => {
        // Act: Make a GET request to the /api/admin/classes endpoint without authentication
        const response = await request(app)
            .post('/api/auth/password_update');

        // Assert: Check if the application correctly handled unauthorized access
        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
        expect(response.body.code).toBe('UNAUTHORIZED');
    });

   

});