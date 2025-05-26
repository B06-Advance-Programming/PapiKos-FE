// Simple wishlist API service
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const wishlistCache = new Map();
const pendingOperations = new Set(); // Track pending add/remove operations

const getAuthHeaders = () => {
  const token = localStorage.getItem('jwtToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Cache management functions
const getCacheKey = (userId, kostId) => `${userId}_${kostId}`;
const getPendingKey = (userId, kostId) => `${userId}_${kostId}`;

const getCachedWishlistStatus = (userId, kostId) => {
  const key = getCacheKey(userId, kostId);
  const cached = wishlistCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.value;
  }
  
  wishlistCache.delete(key);
  return null;
};

const setCachedWishlistStatus = (userId, kostId, status) => {
  const key = getCacheKey(userId, kostId);
  wishlistCache.set(key, {
    value: status,
    timestamp: Date.now()
  });
};

const markPendingOperation = (userId, kostId) => {
  const key = getPendingKey(userId, kostId);
  pendingOperations.add(key);
};

const unmarkPendingOperation = (userId, kostId) => {
  const key = getPendingKey(userId, kostId);
  pendingOperations.delete(key);
};

const hasPendingOperation = (userId, kostId) => {
  const key = getPendingKey(userId, kostId);
  return pendingOperations.has(key);
};

export const clearWishlistCache = (userId, kostId = null) => {
  if (kostId) {
    const key = getCacheKey(userId, kostId);
    wishlistCache.delete(key);
    // Also clear any pending operations for this specific item
    unmarkPendingOperation(userId, kostId);
  } else {
    // Clear all cache entries for this user
    Array.from(wishlistCache.keys())
      .filter(key => key.startsWith(`${userId}_`))
      .forEach(key => wishlistCache.delete(key));
    
    // Clear all pending operations for this user
    Array.from(pendingOperations)
      .filter(key => key.startsWith(`${userId}_`))
      .forEach(key => pendingOperations.delete(key));
  }
};

// Get all items in user's wishlist
export const getWishlist = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/wishlist/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch wishlist: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching wishlist for user ${userId}:`, error);
    throw error;
  }
};

// Add a kost to user's wishlist
export const addToWishlist = async (userId, kostId) => {
  // Mark operation as pending
  markPendingOperation(userId, kostId);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/wishlist/${userId}/add/${kostId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add to wishlist: ${response.status} ${response.statusText}`);
    }
    
    // Update cache
    setCachedWishlistStatus(userId, kostId, true);
    
    return await response.json();
  } catch (error) {
    console.error(`Error adding to wishlist:`, error);
    throw error;
  } finally {
    // Always unmark pending operation
    unmarkPendingOperation(userId, kostId);
  }
};

// Remove a kost from user's wishlist
export const removeFromWishlist = async (userId, kostId) => {
  // Mark operation as pending
  markPendingOperation(userId, kostId);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/wishlist/${userId}/remove/${kostId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to remove from wishlist: ${response.status} ${response.statusText}`);
    }
    
    // Update cache
    setCachedWishlistStatus(userId, kostId, false);
    
    return await response.json();
  } catch (error) {
    console.error(`Error removing from wishlist:`, error);
    throw error;
  } finally {
    // Always unmark pending operation
    unmarkPendingOperation(userId, kostId);
  }
};

// Check if a kost is in user's wishlist (with caching)
export const isInWishlist = async (userId, kostId) => {
  // Check cache first
  const cached = getCachedWishlistStatus(userId, kostId);
  if (cached !== null) {
    return { inWishlist: cached };
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/wishlist/${userId}/check/${kostId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to check wishlist status: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    
    // Only cache the result if there's no pending operation
    // This prevents race conditions where API response overwrites optimistic updates
    if (!hasPendingOperation(userId, kostId)) {
      setCachedWishlistStatus(userId, kostId, result.inWishlist);
    }
    
    return result;
  } catch (error) {
    console.error('Error checking wishlist status:', error);
    throw error;
  }
};

// Bulk check wishlist status for multiple kosts (optimized for performance)
export const bulkCheckWishlist = async (userId, kostIds) => {
  if (!kostIds || kostIds.length === 0) {
    return {};
  }
  
  const results = {};
  const uncachedKostIds = [];
  
  // Check cache first for all kostIds
  kostIds.forEach(kostId => {
    const cached = getCachedWishlistStatus(userId, kostId);
    if (cached !== null) {
      results[kostId] = cached;
    } else {
      uncachedKostIds.push(kostId);
    }
  });
  
  // If all results are cached, return immediately
  if (uncachedKostIds.length === 0) {
    return results;
  }
  
  // For uncached items, make individual API calls in parallel
  try {
    const promises = uncachedKostIds.map(async (kostId) => {
      try {
        const result = await isInWishlist(userId, kostId);
        return { kostId, inWishlist: result.inWishlist };
      } catch (error) {
        console.error(`Error checking wishlist for kost ${kostId}:`, error);
        return { kostId, inWishlist: false };
      }
    });
    
    const apiResults = await Promise.all(promises);
    
    // Merge API results with cached results
    apiResults.forEach(({ kostId, inWishlist }) => {
      results[kostId] = inWishlist;
    });
    
    return results;
  } catch (error) {
    console.error('Error in bulk wishlist check:', error);
    // Return partial results with defaults for failed items
    uncachedKostIds.forEach(kostId => {
      if (!(kostId in results)) {
        results[kostId] = false;
      }
    });
    return results;
  }
};

// Count how many users have added a kost to their wishlist
export const getWishlistCount = async (kostId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/wishlist/count/${kostId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get wishlist count: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting wishlist count:', error);
    throw error;
  }
};
