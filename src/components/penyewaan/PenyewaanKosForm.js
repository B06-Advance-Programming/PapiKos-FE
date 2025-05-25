import React, { useState } from 'react';
import { createPenyewaan } from '../../api/penyewaanApi';
import './PenyewaanKos.css';

const PenyewaanKosForm = ({ kost, userId, onSuccess }) => {
  const [form, setForm] = useState({
    namaLengkap: '',
    nomorTelepon: '',
    tanggalCheckIn: '',
    durasiBulan: 1
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createPenyewaan({ ...form, kostId: kost.kostID, userId });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="penyewaan-form">
      <h3>Rent {kost.nama}</h3>
      <input name="namaLengkap" placeholder="Full Name" onChange={handleChange} required />
      <input name="nomorTelepon" placeholder="Phone Number" onChange={handleChange} required />
      <input name="tanggalCheckIn" type="date" onChange={handleChange} required />
      <input name="durasiBulan" type="number" min="1" onChange={handleChange} required />
      <button type="submit" className="btn-primary">Submit Rental</button>
    </form>
  );
};

export default PenyewaanKosForm;