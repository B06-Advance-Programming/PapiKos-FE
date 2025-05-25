import React, { useState } from 'react';
import { searchKosts, createPenyewaan } from '../../api/penyewaanApi';
import './PenyewaanKos.css';

const PenyewaSearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedKostId, setSelectedKostId] = useState(null);
  const [form, setForm] = useState({
    namaLengkap: '',
    nomorTelepon: '',
    tanggalCheckIn: '',
    durasiBulan: 1
  });

  const handleSearch = async () => {
    try {
      const data = await searchKosts(query);
      setResults(data);
    } catch (err) {
      console.error('Failed to search:', err);
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
      <h2>Search Kos</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name or location"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button onClick={handleSearch} className="btn-primary">Search</button>
      </div>

      <div className="card-grid">
        {results.length === 0 ? (
          <p>No results found.</p>
        ) : (
          results.map(kost => (
            <div className="kost-card" key={kost.kostID}>
              <h4>{kost.nama}</h4>
              <p>{kost.alamat}</p>
              <p>{kost.deskripsi}</p>
              <p>Rooms: {kost.jumlahKamar}</p>
              <p>Price per month: {kost.hargaPerBulan}</p>
              <button className="btn-primary" onClick={() => openForm(kost.kostID)}>Sewa</button>
            </div>
          ))
        )}
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

export default PenyewaSearchPage;
