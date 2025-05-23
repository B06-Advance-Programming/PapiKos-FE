import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getKuponById } from '../../api/kuponApi';
import './kuponDetail.css';

const KuponDetail = () => {
  const { id } = useParams();
  const [kupon, setKupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getKuponById(id)
      .then((data) => {
        setKupon(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching kupon:", err);
        setError("Gagal mengambil detail kupon");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="container"><p>Loading kupon detail...</p></div>;
  if (error) return <div className="container"><p>{error}</p></div>;
  if (!kupon) return <div className="container"><p>Kupon tidak ditemukan</p></div>;

  return (
    <div className="container">
      <div className="detailCard">
        <h1 className="title">🎁 {kupon.namaKupon}</h1>
        
        <div className="infoSection">
          <div className="label">Kode Kupon</div>
          <div className="value">{kupon.kodeUnik}</div>
          
          <div className="label">Potongan</div>
          <div className="value">{kupon.persentase}%</div>
          
          <div className="label">Masa Berlaku</div>
          <div className="value">{kupon.masaBerlaku}</div>
          
          <div className="label">Deskripsi</div>
          <div className="value">{kupon.deskripsi}</div>
          
          <div className="label">Sisa Kuota</div>
          <div className="value">{kupon.quantity} kupon</div>
          
          <div className="label">Status</div>
          <div className="value">
            <span className="statusBadge">{kupon.statusKupon}</span>
          </div>
        </div>

        <Link to="/kupon" className="backButton">
          ← Kembali ke Daftar Kupon
        </Link>
      </div>
    </div>
  );
};

export default KuponDetail;
