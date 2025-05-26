import React, { useState, useEffect } from 'react';
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
    // Immediate visual feedback - start fade out animation
    setFadeOut(true);
    setIsRemoving(true);
    setError(null);
    
    try {
      // Call the parent component's removal handler
      // which handles the API call and optimistic UI updates
      await onRemove(item.kostID || item.kostId);
      // If successful, component will be unmounted by parent
    } catch (error) {
      // Rollback visual state if removal failed
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
    <div className={`wishlist-item ${fadeOut ? 'fade-out' : ''} ${isPendingRemoval ? 'pending-removal' : ''}`}>      <div className="wishlist-item-image">
        <img src={item.imageUrl || 'https://via.placeholder.com/150'} alt={item.nama || item.name} />
      </div>
      <div className="wishlist-item-content">
        <h3>{item.nama || item.name}</h3>
        <p className="location">{item.alamat || item.location}</p>
        <p className="price">Rp {(item.hargaPerBulan || item.price)?.toLocaleString('id-ID')} / bulan</p>
        <div className="details">
          <span>{item.roomType || 'Kost'}</span>
          <span>•</span>
          <span>{item.jumlahKamar || item.roomSize} kamar</span>
        </div>
        {error && <p className="item-error">{error}</p>}
      </div>      <div className="wishlist-item-actions">        <button 
          className={`remove-btn ${isRemoving || isPendingRemoval ? 'removing' : ''}`} 
          onClick={handleRemove}
          disabled={isRemoving || isPendingRemoval}
        >
          {isRemoving ? (
            <>
              <span className="button-spinner"></span>
              Removing...
            </>
          ) : isPendingRemoval ? (
            'Removing...'
          ) : (
            'Remove from Wishlist'
          )}
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

