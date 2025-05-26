import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addToWishlist, removeFromWishlist, isInWishlist } from '../api/wishlistApi';
import './KostCard.css';

const KostCard = ({ kost, initialWishlistStatus = null }) => {
  const { roles } = useAuth();
  const [inWishlist, setInWishlist] = useState(initialWishlistStatus ?? false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [statusChecked, setStatusChecked] = useState(initialWishlistStatus !== null);
  
  const isPenyewa = roles.includes('PENYEWA');
  const userId = localStorage.getItem('userId');
  // Check if item is in wishlist when component mounts (only if not provided as prop)
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!statusChecked && isPenyewa && userId && kost.kostID) {
        try {
          const result = await isInWishlist(userId, kost.kostID);
          setInWishlist(result?.inWishlist || false);
          setStatusChecked(true);
        } catch (error) {
          console.error('Error checking wishlist status:', error);
          setStatusChecked(true);
        }
      }
    };
    
    checkWishlistStatus();
  }, [isPenyewa, userId, kost.kostID, statusChecked]);
  
  const handleWishlistToggle = async (e) => {
    e.stopPropagation(); // Prevent event bubbling
      if (!isPenyewa || !userId) {
      alert('Silakan masuk sebagai penyewa untuk menambahkan item ke wishlist');
      return;
    }
    
    if (wishlistLoading) return; // Prevent double clicks
    
    // Optimistic update - immediately change UI
    const previousState = inWishlist;
    setInWishlist(!inWishlist);
    setWishlistLoading(true);
      try {
      if (previousState) {
        await removeFromWishlist(userId, kost.kostID);
      } else {
        await addToWishlist(userId, kost.kostID);
      }
      // If successful, the optimistic update was correct
    } catch (err) {
      console.error('Error updating wishlist:', err);
      // Revert optimistic update on error
      setInWishlist(previousState);
      alert('Gagal memperbarui wishlist. Silakan coba lagi.');
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
                title={inWishlist ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
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
