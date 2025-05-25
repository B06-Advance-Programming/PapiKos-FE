import React, { useEffect, useState } from 'react';
import { fetchMyPenyewaan, deletePenyewaan } from '../../api/penyewaanApi';
import './PenyewaanKos.css';

const PenyewaanKosMyList = () => {
  const [penyewaanList, setPenyewaanList] = useState([]);

  useEffect(() => {
    fetchMyPenyewaan().then(setPenyewaanList);
  }, []);

  const handleCancel = async (id) => {
    await deletePenyewaan(id);
    setPenyewaanList(penyewaanList.filter(p => p.id !== id));
  };

  return (
    <div className="penyewaan-container">
      <h2>My Rentals</h2>
      <div className="penyewaan-list">
        {penyewaanList.map(p => (
          <div key={p.id} className="penyewaan-card">
            <h4>{p.namaLengkap} - {p.status}</h4>
            <p>{p.tanggalCheckIn} ({p.durasiBulan} months)</p>
            <button onClick={() => handleCancel(p.id)} className="btn-danger">Cancel</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PenyewaanKosMyList;
