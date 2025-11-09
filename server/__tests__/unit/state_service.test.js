import { jest } from '@jest/globals';

// ESM-compatible mocking (fake objects representing fs/promises and fs)
   const mockFsPromises = {
     readFile: jest.fn(),
     writeFile: jest.fn(),
     mkdir: jest.fn(),
     stat: jest.fn(),
     readdir: jest.fn(),
   };
   
   const mockFs = {
     existsSync: jest.fn(),
     mkdirSync: jest.fn(),
   };
   
   // Mock the modules (replace actual fs when imported)
   jest.unstable_mockModule('fs/promises', () => ({
      ...mockFsPromises,
      default: mockFsPromises,
    }));

   jest.unstable_mockModule('fs', () => ({
     ...mockFs,
     default: mockFs,
   }));

//use await with all imports to prevent loading real modules before mocks are set
const fs = await import('fs/promises');
const fsSync = await import('fs');
const  { incrementStorage,getState,reset} = await  import('../../services/upload_storage_state_service.js');
const  {AppError}  = await import('../../errors/AppError.js');
const { post_upload_size_check} = await import ('../../middleware/file_middleware.js');

// Mock fs/promises BEFORE importing the service
describe('Upload Storage State Service - Unit Tests', () => {

    beforeAll(async () => {
        // Clear all mock call history before each test
        jest.clearAllMocks();
        reset();

            
        // Setup default mock behaviors
        // Make writeFile "succeed" (return undefined)
        fs.writeFile.mockResolvedValue(undefined);
        // Make existsSync return false (pretend directory doesn't exist)
        fsSync.existsSync.mockReturnValue(false);
        // Make mkdirSync "succeed"
        fsSync.mkdirSync.mockReturnValue(undefined);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    

    describe('incrementStorage', () => {
        
        it('should NOT write to real files', async () => {
        await incrementStorage(0);

        // Verify fs.writeFile was called (but didn't write)
        expect(fs.writeFile).toHaveBeenCalled();

        // Verify fsSync.mkdirSync was called (but didn't create)
        expect(fsSync.mkdirSync).toHaveBeenCalled();

        // Check what writeFile was called with
        const callArgs = fs.writeFile.mock.calls[0];
        expect(callArgs[0]).toContain('storage-state.json'); // File path
        expect(callArgs[1]).toContain('"totalSize"'); // JSON content of the state object
        
        });

        it('should update lastUpdated timestamp', async () => {
            // can't run reset here since it would reset after the increment and state receive 0 again
            const beforeTime = new Date();
            await incrementStorage(1000); 
            const afterTime = new Date();
            // unix timestamp for easier comparison

            const state = getState();
            const updateTime = new Date(state.lastUpdated); // convert to Date object
            expect(updateTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
            expect(updateTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
        });
    
        
        it('should process queue in order', async () => {
            const executionOrder = [];

            // Mock the increment to track when it happens
            const original_state_value = getState().totalSize;

            // Call three times and track
            const p1 = incrementStorage(100).then(() => executionOrder.push(1));
            const p2 = incrementStorage(200).then(() => executionOrder.push(2));
            const p3 = incrementStorage(300).then(() => executionOrder.push(3));
            const p4 = incrementStorage(400).then(() => executionOrder.push(4));

            await Promise.all([p1, p2, p3, p4]);

            // Verify order
            const updatedState = getState().totalSize;
            expect(executionOrder).toEqual([1, 2, 3, 4]); //  Ran in order
            expect(updatedState).toBe(original_state_value + 1000);    //  Math is correct
        });

        // test the post upload middelware for content size header mismatch
        it('post_upload_size_check should throw error on size mismatch', async () => {
            // arrange : create mock req, res, next
            const req = { headers: {'content-length': '2000'}, file: {size: 6000} };
            const res = {};
            const next = jest.fn();
            // act : call the middleware
            post_upload_size_check(req, res, next);

            // expect next function to be passed an Error with appropriate message
            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0];

            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe('Actual file size differs from Content-Length header');
            expect(error.statusCode).toBe(400);
            expect(error.code).toBe('CONTENT_LENGTH_MISMATCH');
        }); 

    });


});