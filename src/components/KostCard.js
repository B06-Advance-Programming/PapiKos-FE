import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addToWishlist, removeFromWishlist, isInWishlist } from '../api/wishlistApi';
import './KostCard.css';

const KostCard = ({ kost }) => {
  const { roles } = useAuth();
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  const isPenyewa = roles.includes('PENYEWA');const userId = localStorage.getItem('userId');

  // Check if item is in wishlist when component mounts
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (isPenyewa && userId && kost.kostID) {        try {
          const result = await isInWishlist(userId, kost.kostID);
          setInWishlist(result?.inWishlist || false);
        } catch (error) {
          console.error('Error checking wishlist status:', error);
        }
      }
    };
    
    checkWishlistStatus();
  }, [isPenyewa, userId, kost.kostID]);
  
  const handleWishlistToggle = async (e) => {
    e.stopPropagation(); // Prevent event bubbling
    
    if (!isPenyewa || !userId) {
      alert('Please log in as a penyewa to add items to wishlist');
      return;
    }
    
    setWishlistLoading(true);
    
    try {
      if (inWishlist) {
        await removeFromWishlist(userId, kost.kostID);
        setInWishlist(false);
      } else {
        await addToWishlist(userId, kost.kostID);
        setInWishlist(true);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      alert('Failed to update wishlist. Please try again.');
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
      <div className="kost-card">
        <div className="kost-card-image">
          <img src={kost.imageUrl || 'https://cdn-icons-png.freepik.com/512/9524/9524640.png'} alt={kost.nama} />
          {isPenyewa && (
            <div className="wishlist-button-container">
              <button 
                className={`wishlist-button ${inWishlist ? 'in-wishlist' : ''}`}
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <svg className="heart-icon" viewBox="0 0 24 24" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
        </div>
        <div className="kost-card-content">
          <h3 className="kost-name">{kost.nama}</h3>
          <p className="kost-location">{kost.alamat}</p>
          <p className="kost-price">
            Rp {kost.hargaPerBulan?.toLocaleString('id-ID')} / bulan
          </p>
          <div className="kost-details">
            <span>{kost.jumlahKamar} kamar</span>
          </div>
        </div>
      </div>
  );
};

export default KostCard;
