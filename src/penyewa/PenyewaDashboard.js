import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchAllKosts, createPenyewaan } from '../api/penyewaanApi';
import { addToWishlist, removeFromWishlist, bulkCheckWishlist } from '../api/wishlistApi';
import './PenyewaanKos.css';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
};

const PenyewaDashboard = () => {
  const { roles } = useAuth();
  const [kosts, setKosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedKostId, setSelectedKostId] = useState(null);
  const [wishlistStates, setWishlistStates] = useState({});
  const [form, setForm] = useState({
    namaLengkap: '',
    nomorTelepon: '',
    tanggalCheckIn: '',
    durasiBulan: 1
  });
  const isPenyewa = roles?.includes('PENYEWA');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const loadKostsAndWishlist = async () => {
      setLoading(true);
      try {
        const kostsData = await fetchAllKosts();
        setKosts(kostsData);

        if (isPenyewa && userId && kostsData.length > 0) {
          const kostIds = kostsData.map(kost => kost.kostID).filter(Boolean);
          if (kostIds.length > 0) {
            try {
              const wishlistResults = await bulkCheckWishlist(userId, kostIds);
              setWishlistStates(wishlistResults);
            } catch (wishlistError) {
              console.error('Error loading wishlist status:', wishlistError);
              const fallbackStatus = {};
              kostIds.forEach(id => fallbackStatus[id] = false);
              setWishlistStates(fallbackStatus);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch kosts', err);
      } finally {
        setLoading(false);
      }
    };

    loadKostsAndWishlist();
  }, [isPenyewa, userId]);

  const handleWishlistToggle = async (kostId) => {
    if (!isPenyewa || !userId) {
      alert('Please log in as a penyewa to add items to wishlist');
      return;
    }

    const previousState = wishlistStates[kostId];
    setWishlistStates(prev => ({ ...prev, [kostId]: !previousState }));

    try {
      if (previousState) {
        await removeFromWishlist(userId, kostId);
      } else {
        await addToWishlist(userId, kostId);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      setWishlistStates(prev => ({ ...prev, [kostId]: previousState }));
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
      <h2>All Available Kosts</h2>
      <div className="card-grid">
        {loading
          ? [...Array(10)].map((_, i) => (
              <div className="kost-card loading" key={i}>
                <div className="kost-card-header"><div className="skeleton-text short"></div></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
                <div className="skeleton-text short"></div>
                <div className="skeleton-button"></div>
              </div>
            ))
          : kosts.map(kost => (
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
                <p><strong>Address:</strong> {kost.alamat}</p>
                <p><strong>Deskripsi:</strong> {kost.deskripsi}</p>
                <p><strong>Rooms:</strong> {kost.jumlahKamar}</p>
                <p><strong>Price:</strong> {formatRupiah(kost.hargaPerBulan)}</p>
                {kost.jumlahKamar > 0 ? (
                    <button className="btn-primary" onClick={() => openForm(kost.kostID)}>Sewa</button>
                  ) : (
                    <button className="btn-disabled" disabled>Tidak Tersedia</button>
                )}
              </div>
            ))}
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-button" onClick={closeForm}>×</button>
            <h3>Form Penyewaan</h3>
            <form onSubmit={handleSubmit} className="sewa-form">
              <input type="text" name="namaLengkap" placeholder="Nama Lengkap" value={form.namaLengkap} onChange={handleFormChange} required />
              <input type="text" name="nomorTelepon" placeholder="Nomor Telepon" value={form.nomorTelepon} onChange={handleFormChange} required />
              <input type="date" name="tanggalCheckIn" value={form.tanggalCheckIn} onChange={handleFormChange} required />
              <input type="number" name="durasiBulan" placeholder="Durasi Bulan" value={form.durasiBulan} min="1" onChange={handleFormChange} required />
              <div className="form-buttons">
                <button type="submit" className="btn-primary">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PenyewaDashboard;
