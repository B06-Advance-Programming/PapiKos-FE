// Utility functions for API calls

// Create an AbortController for cancellable fetch requests
export const createCancellableRequest = () => {
  const controller = new AbortController();
  const signal = controller.signal;
  
  return {
    signal,
    cancel: () => controller.abort()
  };
};

// Helper untuk sleep
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const retryRequest = async (requestFn, maxRetries = 3, initialDelay = 500) => {
  let retries = 0;
  let delay = initialDelay;
  
  while (retries < maxRetries) {
    try {
      return await requestFn();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      retries++;
      if (retries >= maxRetries) throw error;
      await sleep(delay);
      delay *= 2;
    }
  }
};


// Generate request IDs for tracking and debugging
export const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Create a throttle function to limit multiple requests
export const throttle = (func, limit) => {
  let inThrottle = false;
  return function(...args) {
    if (!inThrottle) {
      inThrottle = true;
      const result = func.apply(this, args);
      setTimeout(() => inThrottle = false, limit);
      return result;
    }
  };
};

// Debounce function to avoid rapid-fire requests
export const debounce = (func, wait) => {
  let timeout;
  return function(...args) {
    const later = () => {
      timeout = null;
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Cache mechanism for API responses
export class ApiCache {
  constructor(expiryTime = 60000) { // Default cache expiry: 1 minute
    this.cache = new Map();
    this.expiryTime = expiryTime;
  }
  
  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    // Check if cache entry has expired
    if (Date.now() - cached.timestamp > this.expiryTime) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.value;
  }
  
  clear() {
    this.cache.clear();
  }
}

// Create a queue for handling sequential requests
export class RequestQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }
  
  enqueue(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        requestFn,
        resolve,
        reject
      });
      this.processQueue();
    });
  }
  
  async processQueue() {
    if (this.processing) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const { requestFn, resolve, reject } = this.queue.shift();
      
      try {
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }
    
    this.processing = false;
  }
}
