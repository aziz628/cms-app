// src/services/api.js
import axios from 'axios';

const API_URL =  "/api";

// for axios instance to handle any request header automatically u need to leave header value empty so like json or multipart/form-data will be set automatically based on the request type
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Create custom events for errors
const createErrorEvent = (error) => {
  const errorEvent = new CustomEvent('api-error', { 
    detail: {
      status: error.response?.status,
      message: error.response?.data?.message || error.message || 'Unknown error occurred',
      url: error.config?.url,
      method: error.config?.method
    }
  });
  document.dispatchEvent(errorEvent);
};

// Add request interceptor (optional)
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method.toUpperCase()} ${API_URL}${config.url} - Payload:`, config.data || config.params || {});
    return config;
  },
  (error) => Promise.reject(error)
);

// log response erros globally and url for debugging
api.interceptors.response.use(
  response => response,
  error => { 
    console.error(`[API] Error: ${error.message} \n from ${API_URL}${error.config?.url}`);
        if (error.response) {
          const status = error.response.status;

          if (status === 401) {
            window.dispatchEvent(new Event('unauthorized'));
          }
           else if (status === 404) {
            createErrorEvent({ 
              ...error, 
              response: { 
                ...error.response, 
                data: { message: 'Resource not found' } 
              }
            });
          }
          else if (status >= 500) {
            createErrorEvent({ 
              ...error, 
              response: { 
                ...error.response, 
                data: { message: 'Server error. Please try again later.' } 
              }
            });
          }else {
            createErrorEvent(error);
          }

        }else if(error.request){
          createErrorEvent({ 
            ...error, 
            response: {
              ...error.response,
              data: { message: 'Network error. Please check your connection.' } 
            }
          });
        }else {
      // Error setting up the request 
      createErrorEvent({
        ...error,
        // Include original error message (custom event have default message just in case)
        response: { data: { message: error.message, request: error.config } }
      });
    }

    return Promise.reject(error);
  }
);

export default api;