// Simple wishlist API service
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('jwtToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
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
  try {
    const response = await fetch(`${API_BASE_URL}/api/wishlist/${userId}/add/${kostId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add to wishlist: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error adding to wishlist:`, error);
    throw error;
  }
};

// Remove a kost from user's wishlist
export const removeFromWishlist = async (userId, kostId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/wishlist/${userId}/remove/${kostId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to remove from wishlist: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error removing from wishlist:`, error);
    throw error;
  }
};

// Check if a kost is in user's wishlist
export const isInWishlist = async (userId, kostId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/wishlist/${userId}/check/${kostId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to check wishlist status: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking wishlist status:', error);
    throw error;
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
