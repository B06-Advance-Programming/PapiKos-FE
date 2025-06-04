import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getKuponById } from '../../api/kuponApi';
import './kuponDetail.css';
import SimpleErrorPopup from './ErrorPopup';

const KuponDetail = () => {
  const { id } = useParams();
  const [kupon, setKupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    getKuponById(id)
      .then((data) => {
        setKupon(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching kupon:", err);
        setErrorMessage("Gagal mengambil detail kupon");
        setLoading(false);
      });
  }, [id]);

  const SimpleSkeletonCard = ({ height = '500px', width = '650px' }) => (
    <div
      className="card"
      style={{
        width: '100%',
        maxWidth: '100%',
        height: 'auto',
        maxHeight: 'none',
        overflow: 'visible',
        boxSizing: 'border-box'
      }}
    >
      <div className="simple-skeleton-card-content">
        <div
          className="simple-skeleton-block"
          style={{ height: height, width: width }}
        ></div>
      </div>
    </div>
  );

  const handleClosePopup = () => {
    setErrorMessage(null);
  };


  if (loading) {
    return (
      <div className="container kupon-list-page-container">
        <SimpleErrorPopup message={errorMessage} onClose={handleClosePopup} />
        <div>
          <SimpleSkeletonCard />
        </div>
      </div>

    );
  }
  if (errorMessage) return <div className="container"><p>{errorMessage}</p></div>;
  if (!kupon) return <div className="container"><p>Kupon tidak ditemukan</p></div>;

  return (
    <div className="container">
      <div key={kupon.idKupon} className={`detailCard ${kupon.statusKupon?.toLowerCase() === 'invalid' ? 'detailCard-invalid' : ''}`}>
        <h1 className="title">🎁 {kupon.namaKupon}</h1>

        <div key={kupon.idKupon} className={`infoSection ${kupon.statusKupon?.toLowerCase() === 'invalid' ? 'infoSection-invalid' : ''}`}>
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
