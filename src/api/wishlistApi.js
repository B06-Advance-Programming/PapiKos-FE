// Mock wishlist API service
import sampleWishlistData from './sampleWishlistData';
import { 
  createCancellableRequest, 
  retryRequest, 
  generateRequestId, 
  ApiCache, 
  RequestQueue 
} from './apiUtils';

// Initialize API cache and request queue
const wishlistCache = new ApiCache(300000); // 5 minutes cache
const wishlistQueue = new RequestQueue();

// Helper function to simulate varied network conditions
const simulateNetworkRequest = (responseData, errorProbability = 0.1, signal) => {
  return new Promise((resolve, reject) => {
    // Random delay between 200ms and 1000ms
    const delay = Math.floor(Math.random() * 800) + 200;
    
    // Randomly determine if this request should fail based on provided probability
    const shouldFail = Math.random() < errorProbability;
    
    const timeoutId = setTimeout(() => {
      if (shouldFail) {
        const error = new Error('Network error occurred. Please try again.');
        error.requestId = generateRequestId();
        reject(error);
      } else {
        resolve(responseData);
      }
    }, delay);
    
    // Handle request cancellation
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        const abortError = new Error('Request was cancelled');
        abortError.name = 'AbortError';
        reject(abortError);
      });
    }
  });
};

// Get all items in user's wishlist
export const getWishlist = async (userId, options = {}) => {
  const cacheKey = `wishlist_${userId}`;
  
  // Check cache first if not forced to bypass
  if (!options.bypassCache) {
    const cachedData = wishlistCache.get(cacheKey);
    if (cachedData) {
      console.log(`Using cached wishlist data for user: ${userId}`);
      return cachedData;
    }
  }
  
  // Create cancellable request
  const { signal } = options.cancellable ? createCancellableRequest() : {};
  
  try {
    console.log(`Fetching wishlist for user: ${userId} ${options.requestId ? `(${options.requestId})` : ''}`);
    
    // Use retry pattern for reliability
    const data = await retryRequest(
      async () => simulateNetworkRequest(sampleWishlistData, 0.05, signal),
      options.maxRetries || 3
    );
    
    // Update cache with fresh data
    wishlistCache.set(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error(`Error fetching wishlist for user ${userId}:`, error);
    throw error;
  }
};

// Add a kost to user's wishlist
export const addToWishlist = async (userId, kostId, options = {}) => {
  // Generate a request ID for tracking
  const requestId = options.requestId || generateRequestId();
  
  try {
    console.log(`Adding kost ${kostId} to wishlist for user ${userId} (${requestId})`);
    
    // Queue the request if we need to ensure sequential processing
    if (options.useQueue) {
      return await wishlistQueue.enqueue(async () => {
        return await processAddToWishlist(userId, kostId, options.signal);
      });
    }
    
    // Otherwise process directly
    return await processAddToWishlist(userId, kostId, options.signal);
  } catch (error) {
    console.error(`Error adding to wishlist (${requestId}):`, error);
    throw error;
  }
};

// Helper function to process the actual add to wishlist request
const processAddToWishlist = async (userId, kostId, signal) => {
  // Simulate backend validation and processing with moderate failure rate (15%)
  const result = await simulateNetworkRequest({ 
    success: true, 
    message: 'Item added to wishlist',
    userId,
    kostId,
    timestamp: new Date().toISOString()
  }, 0.15, signal);
  
  // Invalidate cache after successful add
  wishlistCache.clear();
  
  return result;
};

// Remove a kost from user's wishlist
export const removeFromWishlist = async (userId, kostId, options = {}) => {
  // Generate a request ID for tracking
  const requestId = options.requestId || generateRequestId();
  
  try {
    console.log(`Removing kost ${kostId} from wishlist for user ${userId} (${requestId})`);
    
    // Use retry pattern with backoff for reliability
    const result = await retryRequest(async () => {
      return await simulateNetworkRequest({
        success: true,
        message: 'Item removed from wishlist',
        timestamp: new Date().toISOString()
      }, 0.1, options.signal);
    }, options.maxRetries || 3);
    
    // Invalidate cache after successful removal
    wishlistCache.clear();
    
    return result;
  } catch (error) {
    console.error(`Error removing from wishlist (${requestId}):`, error);
    throw error;
  }
};

// Check if a kost is in user's wishlist
export const isInWishlist = async (userId, kostId, options = {}) => {
  const cacheKey = `wishlist_check_${userId}_${kostId}`;
  
  // Check cache first for quick response
  if (!options.bypassCache) {
    const cachedResult = wishlistCache.get(cacheKey);
    if (cachedResult !== null) {
      return cachedResult;
    }
  }
  
  try {
    console.log(`Checking if kost ${kostId} is in wishlist for user ${userId}`);
    
    // Check if the kostId exists in our sample data
    const isWishlisted = sampleWishlistData.some(item => item.kostId === kostId);
    
    // Simulate network request with very low failure rate
    const result = await simulateNetworkRequest(isWishlisted, 0.02, options.signal);
    
    // Cache the result for a quick response next time
    wishlistCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Error checking wishlist status:', error);
    throw error;
  }
};

// Count how many users have added a kost to their wishlist
export const getWishlistCount = async (kostId, options = {}) => {
  const cacheKey = `wishlist_count_${kostId}`;
  
  // Use cached count if available and not specifically bypassed
  if (!options.bypassCache) {
    const cachedCount = wishlistCache.get(cacheKey);
    if (cachedCount !== null) {
      return cachedCount;
    }
  }
  
  try {
    console.log(`Getting wishlist count for kost ${kostId}`);
    
    // Return a random count between 5 and 50 for mock data
    const mockCount = Math.floor(Math.random() * 46) + 5;
    
    // Simulate network with extremely low failure rate for this simple operation
    const result = await simulateNetworkRequest(mockCount, 0.01, options.signal);
    
    // Cache the count
    wishlistCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Error getting wishlist count:', error);
    throw error;
  }
};

// Get detailed information about a specific wishlist item
export const getWishlistItemDetails = async (wishlistItemId, options = {}) => {
  const cacheKey = `wishlist_item_${wishlistItemId}`;
  
  // Check cache first
  if (!options.bypassCache) {
    const cachedData = wishlistCache.get(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for wishlist item: ${wishlistItemId}`);
      return cachedData;
    }
  }
  
  try {
    console.log(`Fetching details for wishlist item: ${wishlistItemId}`);
    
    // Find the item in the sample data (simulation)
    const item = sampleWishlistData.find(item => item.id === wishlistItemId);
    
    if (!item) {
      throw new Error(`Wishlist item ${wishlistItemId} not found`);
    }
    
    // Add some additional details to simulate enriched data
    const enrichedItem = {
      ...item,
      lastUpdated: new Date().toISOString(),
      availabilityStatus: Math.random() > 0.2 ? 'Available' : 'Limited'
    };
    
    // Simulate network request with low failure rate
    const result = await simulateNetworkRequest(enrichedItem, 0.05, options.signal);
    
    // Cache the result
    wishlistCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error(`Error fetching wishlist item details:`, error);
    throw error;
  }
};
