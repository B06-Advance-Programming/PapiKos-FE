import React, { useEffect, useState } from 'react';
import { getMyBookings, cancelBooking } from '../../api/penyewaanApi';
import './PenyewaanKos.css';

const PenyewaBookingsPage = () => {
  const [bookings, setBookings] = useState([]);

  const loadBookings = async () => {
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings', err);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (booking) => {
        try {
            await cancelBooking(booking);
            alert('Penyewaan berhasil dibatalkan.');
            loadBookings();
        } catch (err) {
            console.error('Failed to cancel', err);
            alert('Gagal membatalkan. Coba lagi.');
        }
    };

  return (
    <div className="penyewa-container">
      <h2>My Bookings</h2>
      {bookings.length === 0 ? (
        <p>You have no bookings yet.</p>
      ) : (
        <div className="card-grid">
          {bookings.map(b => (
            <div className="kost-card" key={b.id}>
              <h4>{b.namaLengkap}</h4>
              <p><strong>Kost Name:</strong> {b.namaKos}</p>
              <p><strong>Check-in:</strong> {b.tanggalCheckIn}</p>
              <p><strong>Duration:</strong> {b.durasiBulan} months</p>
              <p><strong>Status:</strong> {b.status}</p>
              {b.status === 'DIAJUKAN' ? (
                <button className="btn-danger" onClick={() => handleCancel(b)}>Batalkan</button>
                ) : (
                <button className="btn-disabled" disabled>({b.status})</button>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PenyewaBookingsPage;
