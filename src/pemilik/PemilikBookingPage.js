import React, { useEffect, useState } from 'react';
import { getPemilikBookings, setujuiBooking} from '../api/penyewaanApi';
import './PenyewaanKos.css';

const PemilikBookingPage = () => {
  const [bookings, setBookings] = useState([]);

  const loadBookings = async () => {
    try {
      const data = await getPemilikBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings', err);
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
                <button className="btn-primary" onClick={() => handleSetujui(b)}>Konfirmasi</button>
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

export default PemilikBookingPage;
