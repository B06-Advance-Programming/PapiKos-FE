import React, { useEffect, useState } from 'react';
import { fetchAllKosts } from '../api/penyewaanApi';
import './PenyewaanKos.css';

const PenyewaanKosList = ({ onSelect }) => {
  const [kosts, setKosts] = useState([]);

  useEffect(() => {
    fetchAllKosts().then(setKosts);
  }, []);

  return (
    <div className="penyewaan-container">
      <h2>Available Kosts</h2>
      <div className="penyewaan-list">
        {kosts.map(kost => (
          <div key={kost.kostID} className="penyewaan-card" onClick={() => onSelect(kost)}>
            <h3>{kost.nama}</h3>
            <p>{kost.alamat}</p>
            <p>{kost.deskripsi}</p>
            <p>{kost.jumlahKamar} rooms - Rp {kost.hargaPerBulan}/month</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PenyewaanKosList;