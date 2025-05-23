import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './WishlistItem.css';

const WishlistItem = ({ item, userId, onRemove, isPendingRemoval = false }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState(null);
  const [fadeOut, setFadeOut] = useState(false);

  // Apply fade-out animation when pending removal
  useEffect(() => {
    if (isPendingRemoval) {
      setFadeOut(true);
    }
  }, [isPendingRemoval]);

  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      setError(null);
      setFadeOut(true);
      
      // Call the parent component's removal handler
      // which handles the API call and optimistic UI updates
      await onRemove(item.kostId);
    } catch (error) {
      // This will only run if the parent component doesn't catch the error
      console.error('Failed to remove item from wishlist:', error);
      setError('Failed to remove. Try again.');
      setFadeOut(false);
      
      // Auto-dismiss error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsRemoving(false);
    }
  };
  return (
    <div className={`wishlist-item ${fadeOut ? 'fade-out' : ''} ${isPendingRemoval ? 'pending-removal' : ''}`}>
      <div className="wishlist-item-image">
        <img src={item.imageUrl || 'https://via.placeholder.com/150'} alt={item.name} />
      </div>
      <div className="wishlist-item-content">
        <h3>{item.name}</h3>
        <p className="location">{item.location}</p>
        <p className="price">Rp {item.price.toLocaleString('id-ID')} / bulan</p>
        <div className="details">
          <span>{item.roomType}</span>
          <span>•</span>
          <span>{item.roomSize} m²</span>
        </div>
        {error && <p className="item-error">{error}</p>}
      </div>
      <div className="wishlist-item-actions">
        <Link to={`/kost/${item.kostId}`} className="view-btn">View Details</Link>
        <button 
          className={`remove-btn ${isRemoving || isPendingRemoval ? 'removing' : ''}`} 
          onClick={handleRemove}
          disabled={isRemoving || isPendingRemoval}
        >
          {isRemoving || isPendingRemoval ? 'Removing...' : 'Remove from Wishlist'}
        </button>
        
        {isPendingRemoval && !isRemoving && (
          <div className="processing-overlay">
            <div className="processing-spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistItem;

