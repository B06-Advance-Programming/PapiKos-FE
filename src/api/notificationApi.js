// Notification API service
import { createCancellableRequest, retryRequest, generateRequestId, ApiCache } from './apiUtils';

// Base URL from environment
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Initialize API cache
const notificationCache = new ApiCache(60000); // 1 minute cache for notifications

// Get all notifications for a user
export const getUserNotifications = async (userId, options = {}) => {
  const cacheKey = `notifications_${userId}`;
  
  // Check cache first if not forced to bypass
  if (!options.bypassCache) {
    const cachedData = notificationCache.get(cacheKey);
    if (cachedData) {
      console.log(`Using cached notifications data for user: ${userId}`);
      return cachedData;
    }
  }
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const { signal } = options.cancellable ? createCancellableRequest() : {};
    
    console.log(`Fetching notifications for user: ${userId}`);
    
    const response = await retryRequest(
      async () => {
        const res = await fetch(`${API_BASE_URL}/api/notifications/inbox/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          signal
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Error fetching notifications: ${res.status}`);
        }
        
        return await res.json();
      },
      options.maxRetries || 3
    );
    
    // Update cache with fresh data
    notificationCache.set(cacheKey, response);
    
    return response;
  } catch (error) {
    console.error(`Error fetching notifications for user ${userId}:`, error);
    throw error;
  }
};

// Get notification count for a user
export const getNotificationCount = async (userId, options = {}) => {
  const cacheKey = `notifications_count_${userId}`;
  
  // Check cache first if not forced to bypass
  if (!options.bypassCache) {
    const cachedData = notificationCache.get(cacheKey);
    if (cachedData !== null) {
      console.log(`Using cached notification count for user: ${userId}`);
      return cachedData;
    }
  }
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const { signal } = options.cancellable ? createCancellableRequest() : {};
    
    console.log(`Fetching notification count for user: ${userId}`);
    
    const response = await retryRequest(
      async () => {
        const res = await fetch(`${API_BASE_URL}/api/notifications/count/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          signal
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Error fetching notification count: ${res.status}`);
        }
        
        const data = await res.json();
        return data.count;
      },
      options.maxRetries || 3
    );
    
    // Update cache with fresh data
    notificationCache.set(cacheKey, response);
    
    return response;
  } catch (error) {
    console.error(`Error fetching notification count for user ${userId}:`, error);
    throw error;
  }
};

// Get a specific notification by ID
export const getNotificationById = async (notificationId, options = {}) => {
  const cacheKey = `notification_${notificationId}`;
  
  // Check cache first if not forced to bypass
  if (!options.bypassCache) {
    const cachedData = notificationCache.get(cacheKey);
    if (cachedData) {
      console.log(`Using cached notification data for ID: ${notificationId}`);
      return cachedData;
    }
  }
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const { signal } = options.cancellable ? createCancellableRequest() : {};
    
    console.log(`Fetching notification with ID: ${notificationId}`);
    
    const response = await retryRequest(
      async () => {
        const res = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          signal
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Error fetching notification: ${res.status}`);
        }
        
        return await res.json();
      },
      options.maxRetries || 3
    );
    
    // Update cache with fresh data
    notificationCache.set(cacheKey, response);
    
    return response;
  } catch (error) {
    console.error(`Error fetching notification with ID ${notificationId}:`, error);
    throw error;
  }
};

// Admin functions
// Create a notification for a specific user (admin only)
export const createNotification = async (userId, message, options = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const requestId = options.requestId || generateRequestId();
    const { signal } = options.cancellable ? createCancellableRequest() : {};
    
    console.log(`Creating notification for user ${userId} (${requestId})`);
    
    const response = await retryRequest(
      async () => {
        const res = await fetch(`${API_BASE_URL}/api/notifications/create/${userId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message }),
          signal
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Error creating notification: ${res.status}`);
        }
        
        return await res.json();
      },
      options.maxRetries || 3
    );
    
    // Invalidate cache after creating a notification
    notificationCache.clear();
    
    return response;
  } catch (error) {
    console.error(`Error creating notification:`, error);
    throw error;
  }
};

// Broadcast a notification to all users (admin only)
export const broadcastNotification = async (message, options = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const requestId = options.requestId || generateRequestId();
    const { signal } = options.cancellable ? createCancellableRequest() : {};
    
    console.log(`Broadcasting notification to all users (${requestId})`);
    
    const response = await retryRequest(
      async () => {
        const res = await fetch(`${API_BASE_URL}/api/notifications/broadcast`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message }),
          signal
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Error broadcasting notification: ${res.status}`);
        }
        
        return await res.json();
      },
      options.maxRetries || 3
    );
    
    // Invalidate cache after broadcasting a notification
    notificationCache.clear();
    
    return response;
  } catch (error) {
    console.error(`Error broadcasting notification:`, error);
    throw error;
  }
};

// Delete a notification (admin only)
export const deleteNotification = async (notificationId, options = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const requestId = options.requestId || generateRequestId();
    const { signal } = options.cancellable ? createCancellableRequest() : {};
    
    console.log(`Deleting notification with ID ${notificationId} (${requestId})`);
    
    const response = await retryRequest(
      async () => {
        const res = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          signal
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Error deleting notification: ${res.status}`);
        }
        
        return await res.json();
      },
      options.maxRetries || 3
    );
    
    // Invalidate cache after deleting a notification
    notificationCache.clear();
    
    return response;
  } catch (error) {
    console.error(`Error deleting notification with ID ${notificationId}:`, error);
    throw error;
  }
};
