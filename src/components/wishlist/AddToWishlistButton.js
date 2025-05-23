import React, { useState, useEffect } from 'react';
import { addToWishlist, removeFromWishlist, isInWishlist } from '../../api/wishlistApi';
import './AddToWishlistButton.css';

const AddToWishlistButton = ({ kostId, userId }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        setLoading(true);
        const status = await isInWishlist(userId, kostId);
        setIsWishlisted(status);
      } catch (error) {
        console.error('Error checking wishlist status:', error);
        setIsWishlisted(false);
      } finally {
        setLoading(false);
      }
    };

    if (userId && kostId) {
      checkWishlistStatus();
    }
  }, [userId, kostId]);

  const toggleWishlist = async () => {
    try {
      setLoading(true);
      if (isWishlisted) {
        await removeFromWishlist(userId, kostId);
        setIsWishlisted(false);
      } else {
        await addToWishlist(userId, kostId);
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      className={`wishlist-button ${isWishlisted ? 'wishlisted' : ''}`}
      onClick={toggleWishlist}
      disabled={loading}
    >
      {loading ? (
        <span className="loading-indicator"></span>
      ) : (
        <>
          <span className="heart-icon">
            {isWishlisted ? '❤️' : '🤍'}
          </span>
          <span className="wishlist-text">
            {isWishlisted ? 'Saved' : 'Save'}
          </span>
        </>
      )}
    </button>
  );
};

export default AddToWishlistButton;
