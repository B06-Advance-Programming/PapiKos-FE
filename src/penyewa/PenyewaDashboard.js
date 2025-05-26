import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchAllKosts, createPenyewaan } from '../api/penyewaanApi';
import { addToWishlist, removeFromWishlist, isInWishlist } from '../api/wishlistApi';
import './PenyewaanKos.css';

const PenyewaDashboard = () => {
  const { roles } = useAuth();
  const [kosts, setKosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedKostId, setSelectedKostId] = useState(null);
  const [wishlistStates, setWishlistStates] = useState({}); // Track wishlist state for each kost
  const [form, setForm] = useState({
    namaLengkap: '',
    nomorTelepon: '',
    tanggalCheckIn: '',
    durasiBulan: 1
  });
  const isPenyewa = roles?.includes('PENYEWA');  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchAllKosts().then(setKosts).catch(err => console.error('Failed to fetch kosts', err));
  }, []);
  // Check wishlist status for all kosts when they're loaded
  useEffect(() => {
    const checkAllWishlistStatus = async () => {
      if (isPenyewa && userId && kosts.length > 0) {
        const wishlistStatus = {};
        for (const kost of kosts) {          try {
            const result = await isInWishlist(userId, kost.kostID);
            wishlistStatus[kost.kostID] = result?.inWishlist || false;
          } catch (error) {
            console.error(`Error checking wishlist status for kost ${kost.kostID}:`, error);
            wishlistStatus[kost.kostID] = false;
          }
        }
        setWishlistStates(wishlistStatus);
      }
    };

    checkAllWishlistStatus();
  }, [isPenyewa, userId, kosts]);

  const handleWishlistToggle = async (kostId) => {
    if (!isPenyewa || !userId) {
      alert('Please log in as a penyewa to add items to wishlist');
      return;
    }

    try {
      const isCurrentlyInWishlist = wishlistStates[kostId];
      
      if (isCurrentlyInWishlist) {
        await removeFromWishlist(userId, kostId);
        setWishlistStates(prev => ({ ...prev, [kostId]: false }));
      } else {
        await addToWishlist(userId, kostId);
        setWishlistStates(prev => ({ ...prev, [kostId]: true }));
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      alert('Failed to update wishlist. Please try again.');
    }
  };

  const openForm = (kostId) => {
    setSelectedKostId(kostId);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm({
      namaLengkap: '',
      nomorTelepon: '',
      tanggalCheckIn: '',
      durasiBulan: 1
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userId');
      await createPenyewaan({
        ...form,
        status: 'DIAJUKAN',
        kostId: selectedKostId,
        userId
      });
      alert('Penyewaan berhasil diajukan!');
      closeForm();
    } catch (err) {
      console.error('Failed to sewa', err);
      alert('Gagal menyewa. Coba lagi.');
    }
  };

  return (
    <div className="penyewa-container">
      <h2>All Available Kosts</h2>      <div className="card-grid">
        {kosts.map(kost => (
          <div className="kost-card" key={kost.kostID}>
            <div className="kost-card-header">
              <h4>{kost.nama}</h4>
              {isPenyewa && (
                <button 
                  className={`wishlist-btn ${wishlistStates[kost.kostID] ? 'in-wishlist' : ''}`}
                  onClick={() => handleWishlistToggle(kost.kostID)}
                  title={wishlistStates[kost.kostID] ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <svg className="heart-icon" viewBox="0 0 24 24" fill={wishlistStates[kost.kostID] ? 'currentColor' : 'none'} stroke="currentColor">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
            <p>{kost.alamat}</p>
            <p>{kost.deskripsi}</p>
            <p>Rooms: {kost.jumlahKamar}</p>
            <p>Price: {kost.hargaPerBulan}</p>
            <button className="btn-primary" onClick={() => openForm(kost.kostID)}>Sewa</button>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Form Penyewaan</h3>
            <form onSubmit={handleSubmit} className="sewa-form">
              <input
                type="text"
                name="namaLengkap"
                placeholder="Nama Lengkap"
                value={form.namaLengkap}
                onChange={handleFormChange}
                required
              />
              <input
                type="text"
                name="nomorTelepon"
                placeholder="Nomor Telepon"
                value={form.nomorTelepon}
                onChange={handleFormChange}
                required
              />
              <input
                type="date"
                name="tanggalCheckIn"
                value={form.tanggalCheckIn}
                onChange={handleFormChange}
                required
              />
              <input
                type="number"
                name="durasiBulan"
                placeholder="Durasi Bulan"
                value={form.durasiBulan}
                min="1"
                onChange={handleFormChange}
                required
              />
              <div className="form-buttons">
                <button type="submit" className="btn-primary">Submit</button>
                <button type="button" className="btn-secondary" onClick={closeForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PenyewaDashboard;
