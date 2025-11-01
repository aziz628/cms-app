// src/context/NotificationContext.jsx
import  { createContext, useContext,useEffect, useState } from 'react';
import { Toast } from '../components/common/Toast';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  
  // Add a new notification
  const addNotification = (notification) => {
    // use something true unique id generator in production
    const id =  Math.random().toString(36).slice(2, 11); // generates a random string of 9 characters
    
    setNotifications(prev => [...prev, { ...notification, id }]);
    
    // Auto-dismiss after timeout unless it's persistent
    if (!notification.persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 3000);
    }
    
    return id;
  };

  // Remove a notification by ID
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Helper methods for common notification types
  const success = (message, options = {}) => {
    return addNotification({ type: 'success', message, ...options });
  };

  const error = (message, options = {}) => {
    return addNotification({ type: 'error', message, ...options });
  };

  const warning = (message, options = {}) => {
    return addNotification({ type: 'warning', message, ...options });
  };

  const info = (message, options = {}) => {
    return addNotification({ type: 'info', message, ...options });
  };

  useEffect(() => {
     const handleApiError = (event) => {
      const errorData = event.detail;
      // log to console for debugging
      console.error('Debugging API Error:', errorData);

      // Add the error as a notification
      error(errorData.message, { 
        persistent: errorData.status >= 500, // Make server errors persistent
      });
    };
    document.addEventListener('api-error', handleApiError);
    return () => {
      document.removeEventListener('api-error', handleApiError);
    };
  }, []);
  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      addNotification, 
      removeNotification,
      success,
      error,
      warning,
      info
    }}>
      {children}
      <div className="toast-container fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <Toast 
            key={notification.id}
            type={notification.type}
            message={notification.message}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);