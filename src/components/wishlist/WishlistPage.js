import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getWishlist, removeFromWishlist} from '../../api/wishlistApi';
import WishlistItem from './WishlistItem';
import './WishlistPage.css';

const WishlistPage = () => {  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Get user ID from localStorage (stored by AuthContext)
  const userId = localStorage.getItem("userId");    // Fetch wishlist data
  const fetchWishlist = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const data = await getWishlist(userId);
      setWishlist(data);    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Gagal memuat wishlist. Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  }, [userId]);// Handle removing items from wishlist with optimistic updates
  const handleRemoveFromWishlist = useCallback(async (kostId) => {
    // Store the item being removed for potential rollback
    const itemToRemove = wishlist.find(item => (item.kostID || item.kostId) === kostId);
    const itemIndex = wishlist.findIndex(item => (item.kostID || item.kostId) === kostId);
    
    if (!itemToRemove) {
      console.error('Item not found in wishlist');
      return;
    }

    // Clear any existing messages
    setError(null);
    setSuccessMessage(null);

    // Optimistic update - immediately remove from UI
    setWishlist(prev => prev.filter(item => (item.kostID || item.kostId) !== kostId));
    
    try {
      // Make API call in the background
      await removeFromWishlist(userId, kostId);
        // Show success message
      setSuccessMessage(`${itemToRemove.nama || 'Item'} dihapus dari wishlist`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error) {
      console.error(`Failed to remove item ${kostId} from wishlist:`, error);
      
      // Rollback optimistic update - restore the item at its original position
      setWishlist(prev => {
        const newWishlist = [...prev];
        newWishlist.splice(itemIndex, 0, itemToRemove);
        return newWishlist;
      });
        // Show error message
      setError(`Gagal menghapus ${itemToRemove.nama || 'item'} dari wishlist. ${error.message || 'Silakan coba lagi.'}`);
      
      // Auto-dismiss error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  }, [userId, wishlist]);
    // Load wishlist data when component mounts
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);
  const handleRefresh = () => {
    setError(null);
    setSuccessMessage(null);
    fetchWishlist();
  };
    // If no userId, user is not authenticated
  if (!userId) {
    return (
      <div className="wishlist-page">
        <div className="container">
          <h1>Wishlist Saya</h1>
          <div className="error-message">
            <p>Silakan masuk untuk melihat wishlist Anda.</p>
            <Link to="/login" className="login-link">Masuk</Link>
          </div>
        </div>
      </div>
    );
  }
    // Render empty state when wishlist is empty
  const renderEmptyState = () => (
    <div className="wishlist-empty">
      <h3>Wishlist Anda kosong</h3>
      <p>Mulai menambahkan kost ke wishlist Anda!</p>
      <Link to="/" className="btn-primary">Jelajahi Kost</Link>
    </div>
  );
  // Loading state
  if (loading) {
    return (
      <div className="wishlist-container">
        <h2>Wishlist Saya</h2>
        <div className="wishlist-loading">
          <div className="loading-spinner"></div>
          <p>Memuat wishlist Anda...</p>
        </div>
      </div>
    );
  }
  
  return (    <div className="wishlist-container">      <div className="wishlist-header">
        <h2>Wishlist Saya</h2>
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
        {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
        </div>
      )}
        {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Tutup</button>
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
