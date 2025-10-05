import request from 'supertest';
import app from '../../app.js';
import {generateTokens} from '../../services/token_service.js';


// 'describe' is a Jest function that groups related tests together.
// Everything for our Authentication API will go inside this block.
// It helps keep tests organized.
  describe('Auth Api', ()=>{  
  let auth_cookies;
  let updated_username;
  let updated_password;

  afterAll(async ()=>{
    //set username and password back to original values
    // arrange
    const username= process.env.ADMIN_USERNAME || "admin"
    const password= process.env.ADMIN_PASSWORD || "admin_password"

    // act
    const response = await request(app)
          .post('/api/auth/username_update')
            .set('Cookie', auth_cookies)
            .send({ new_username:username})
    

    const response2 = await request(app)
          .post('/api/auth/password_update')
            .set('Cookie', auth_cookies)
            .send({ new_password:password})
    // assert
    expect(response.statusCode).toBe(200)
    expect(response.body.message).toBe('Username updated successfully')
    expect(response2.statusCode).toBe(200)
    expect(response2.body.message).toBe('Password updated successfully')

  })

// -- login tests --
    //  happy path - a successful login.
  it('should return 200 on successful login with correct credentials', async () => {
        // 1. ARRANGE
        // We set up the data we need for the test. In this case, it's the
        // login credentials. We will use the default admin credentials
        // from your .env file for this test.
        const credentials = {
          username: 'admin',
          password: 'admin_password'
        };

        // 2. ACT
        // We perform the action we want to test: making a POST request to the /login endpoint.
          // Action: Gets our app ready for testing.
          // Returns: A special supertest object that has methods for making requests.
      
      const response = await  request(app)
      
          // Action: Takes the object from the previous step and tells it, "I want to prepare a POST request to the /api/auth/login endpoint.
          // Returns: The same object, but now it's configured to make a POST request. This is what allows us to chain the next method.
      .post('/api/auth/login')
          // Action: Takes the configured POST request object and tells it, "Attach this credentials object as the JSON body of the request." This is the equivalent of putting your data in the "Body" tab in Postman.
          // Returns: A "promise" that will resolve with the server's response once the request is complete. We use await to wait for this promise to finish.
      .send(credentials);

          // 3. ASSERT
      // We check if the result of our action is what we expected.
      // We expect the HTTP status code to be 200 (OK).
      expect(response.statusCode).toBe(200);
      
      // We also expect the response body to contain a success message.
      expect(response.body.message).toBe('Login successful');

      // access and refresh tokens should be set in the response cookies 
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'].length).toBeGreaterThan(0);
      expect(response.headers['set-cookie'][0]).toMatch(/access_token/);
      expect(response.headers['set-cookie'][1]).toMatch(/refresh_token/);
      // save the cookies for later
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

        auth_cookies=response2.headers['set-cookie']


    })
    // happy path - logout
    it('should logout the user',async ()=>{

      // arrange
      const credentials= {
        username:updated_username,
        password:updated_password
      }

      // act 
      const response = await request(app)
            .post('/api/auth/logout')
            .set('Cookie', auth_cookies)
            .send(credentials);

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

    // try session expired by making using one second lifespan tokens  
    // then run delay then try secure endpoint
    it("should return 401 for expired refresh token", async () => {
      // arrange
      const {access_token, refresh_token} = generateTokens({access_token_lifespan: 1, refresh_token_lifespan: 1}) // tokens expire in 1 second
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


})




