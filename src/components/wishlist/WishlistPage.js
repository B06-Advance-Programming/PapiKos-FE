import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getWishlist, removeFromWishlist} from '../../api/wishlistApi';
import WishlistItem from './WishlistItem';
import './WishlistPage.css';

const WishlistPage = () => {  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get user ID from localStorage (stored by AuthContext)
  const userId = localStorage.getItem("userId");
    // Fetch wishlist data
  const fetchWishlist = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getWishlist(userId);
      setWishlist(data);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Failed to load wishlist. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [userId]);
  // Handle removing items from wishlist
  const handleRemoveFromWishlist = useCallback(async (kostId) => {
    try {
      await removeFromWishlist(userId, kostId);
      
      // Remove item from local state
      setWishlist(prev => prev.filter(item => (item.kostID || item.kostId) !== kostId));
    } catch (error) {
      console.error(`Failed to remove item ${kostId} from wishlist:`, error);
      setError(`Failed to remove item from wishlist: ${error.message}`);
    }
  }, [userId]);
    // Load wishlist data when component mounts
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRefresh = () => {
    fetchWishlist();
  };
  
  // If no userId, user is not authenticated
  if (!userId) {
    return (
      <div className="wishlist-page">
        <div className="container">
          <h1>My Wishlist</h1>
          <div className="error-message">
            <p>Please log in to view your wishlist.</p>
            <Link to="/login" className="login-link">Go to Login</Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Render empty state when wishlist is empty
  const renderEmptyState = () => (
    <div className="wishlist-empty">
      <h3>Your wishlist is empty</h3>
      <p>Start adding boarding houses to your wishlist!</p>
      <Link to="/" className="btn-primary">Explore Kosts</Link>
    </div>
  );
    // Loading state
  if (loading) {
    return (
      <div className="wishlist-container">
        <h2>My Wishlist</h2>
        <div className="wishlist-loading">
          <div className="loading-spinner"></div>
          <p>Loading your wishlist...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="wishlist-container">      <div className="wishlist-header">
        <h2>My Wishlist</h2>
        <button 
          className="refresh-button"
          onClick={handleRefresh}
          disabled={loading}
        >
          <svg className="refresh-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m-4.991 0v-4.991" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => fetchWishlist()}>Try Again</button>
        </div>
      )}
      
      {!loading && wishlist.length === 0 && !error ? (
        renderEmptyState()
      ) : (        <div className="wishlist-items">
          {wishlist.map(item => (
            <WishlistItem
              key={item.kostID || item.kostId || item.id}
              item={item}
              onRemove={handleRemoveFromWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
