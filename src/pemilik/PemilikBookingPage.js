import React, { useEffect, useState } from 'react';
import { getPemilikBookings, setujuiBooking } from '../api/penyewaanApi';
import './PenyewaanKos.css';

const PemilikBookingPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await getPemilikBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleSetujui = async (booking) => {
    try {
      await setujuiBooking(booking);
      alert('Penyewaan berhasil disetujui.');
      loadBookings();
    } catch (err) {
      console.error('Failed to accept', err);
      alert('Gagal menyetujui. Coba lagi.');
    }
  };

  return (
    <div className="penyewa-container">
      <h2>My Bookings</h2>
      <div className="card-grid">
        {loading ? (
          [...Array(10)].map((_, i) => (
            <div className="kost-card loading" key={i}>
              <div className="skeleton-text short"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-button"></div>
            </div>
          ))
        ) : bookings.length === 0 ? (
          <p>You have no bookings yet.</p>
        ) : (
          bookings.sort((a, b) => {
            if (a.status === 'DIAJUKAN' && b.status !== 'DIAJUKAN') return -1;
            if (a.status !== 'DIAJUKAN' && b.status === 'DIAJUKAN') return 1;
            return 0;
          })
          .map(b => (
            <div className="kost-card" key={b.id}>
              <h4>{b.namaLengkap}</h4>
              <p><strong>Kost Name:</strong> {b.namaKos}</p>
              <p><strong>Check-in:</strong> {b.tanggalCheckIn}</p>
              <p><strong>Duration:</strong> {b.durasiBulan} months</p>
              <p><strong>Status:</strong> {b.status}</p>
              {b.status === 'DIAJUKAN' ? (
                <button className="btn-primary" onClick={() => handleSetujui(b)}>Konfirmasi</button>
              ) : (
                <button className="btn-disabled" disabled>({b.status})</button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PemilikBookingPage;
