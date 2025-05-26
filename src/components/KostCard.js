import React from 'react';
import './KostCard.css';

const KostCard = ({ kost }) => {
  return (
      <div className="kost-card">
        <div className="kost-card-image">
          <img src={kost.imageUrl || 'https://cdn-icons-png.freepik.com/512/9524/9524640.png'} alt={kost.nama} />
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
