import React, { useEffect, useState, useCallback } from "react";
import { Link } from 'react-router-dom';
import {
  getAllKupons,
  deleteKupon,
  getKuponsByOwnerId,
} from "../../api/kuponApi";
import { useAuth } from '../../contexts/AuthContext';
import SimpleErrorPopup from './ErrorPopup';
import "./kuponList.css";

export default function KuponList() {
  const [kupons, setKupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const { roles, user } = useAuth();

  const isAdmin = roles.includes("ADMIN");
  const isPemilik = roles.includes("PEMILIK");
  const canEditOrDelete = isAdmin || isPemilik;

  const SimpleSkeletonCard = () => (
  <div className="card"> 
    <div className="simple-skeleton-card-content">
      <div className="simple-skeleton-block" style={{ height: '24px', width: '70%' }}></div>
      <div className="simple-skeleton-block" style={{ height: '16px', width: '90%' }}></div>
      <div className="simple-skeleton-block" style={{ height: '16px', width: '80%' }}></div>
      <div className="simple-skeleton-block" style={{ height: '30px', width: '50%', marginTop: '15px' }}></div>
    </div>
  </div>
);


  const fetchKuponsData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      let data = [];
      if (isPemilik && user?.id) {
        data = await getKuponsByOwnerId(user.id);
      } else {
        data = await getAllKupons();
      }
      setKupons(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Fetch error:", e.message);
      setErrorMessage(e.message || "Gagal memuat kupon. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [isPemilik, user]);

  useEffect(() => {
    fetchKuponsData();
  }, [fetchKuponsData]);

  const handleDelete = async (idKupon, namaKupon) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus kupon "${namaKupon}"?`)) {
      try {
        await deleteKupon(idKupon);
        setKupons(prevKupons => prevKupons.filter(k => k.idKupon !== idKupon));
        alert(`Kupon "${namaKupon}" berhasil dihapus.`);
      } catch (e) {
        console.error("[KuponList] Delete error:", e.message);
        setErrorMessage(e.message || "Gagal menghapus kupon. Silakan coba lagi.");
      }
    }
  };

  const handleClosePopup = () => {
    setErrorMessage(null);
  };


  if (loading) {
    return (
      <div className="container kupon-list-page-container">
        <SimpleErrorPopup message={errorMessage} onClose={handleClosePopup} />
        
        <div className="header">
          <h1 className="title">Daftar Kupon</h1>
          {canEditOrDelete && (
            <Link to="/kupon/new" className="create-button" style={loading ? { pointerEvents: 'none', opacity: 0.5 } : {}}>
              + Buat Kupon Baru
            </Link>
          )}
        </div>
        <div className="grid">
          {[...Array(3)].map((_, index) => (
            <SimpleSkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }
  

  return (
    <div className="container kupon-list-page-container">
      <SimpleErrorPopup message={errorMessage} onClose={handleClosePopup} />

      <div className="header">
        <h1 className="title">Daftar Kupon</h1>
        {canEditOrDelete && (
          <Link to="/kupon/new" className="create-button">
            + Buat Kupon Baru
          </Link>
        )}
      </div>

      {errorMessage && kupons.length === 0 && !loading && (
        <div style={{ textAlign: 'center', color: 'red', marginTop: '20px' }}>
          <p>{errorMessage}</p>
          <button onClick={fetchKuponsData} style={{ padding: '8px 12px', marginTop: '10px' }}>Coba Lagi</button>
        </div>
      )}

      {kupons.length > 0 && (
        <div className="grid">
          {kupons.map((kupon) => (
            <div key={kupon.idKupon} className={`card ${kupon.statusKupon?.toLowerCase() === 'invalid' ? 'card-invalid' : ''}`}>
              <h3 className="cardTitle">{kupon.namaKupon}</h3>
              <p><strong>Persentase:</strong> {kupon.persentase}%</p>
              <p><strong>Berlaku sampai:</strong> {new Date(kupon.masaBerlaku).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              <p><strong>Status:</strong>{" "}
                <span className={`status-badge status-${kupon.statusKupon?.toLowerCase()}`}>
                  {kupon.statusKupon}
                </span>
              </p>
              <p className="card-description"><strong>Deskripsi:</strong> {kupon.deskripsi || "-"}</p>
              <p><strong>Jumlah:</strong> {kupon.quantity}</p>
              <p>
                <strong>Kost Pemilik: </strong>
                {kupon.kosPemilik && kupon.kosPemilik.length > 0
                  ? kupon.kosPemilik.map(k => k.nama).join(", ")
                  : "-"}
              </p>
              <div className="card-actions">
                <Link
                  to={`/kupon/${kupon.idKupon}`}
                  className="action-button detailButton"
                >
                  Detail
                </Link>
                {canEditOrDelete && (
                  <>
                    <Link
                      style={{fontSize: 15}}
                      to={`/kupon/${kupon.idKupon}/edit`}
                      className="action-button edit-button"
                    >
                      Edit
                    </Link>
                    <button
                      className="action-button delete-button" style={{padding: '8px', textDecoration: 'underline'}}
                      onClick={() => handleDelete(kupon.idKupon, kupon.namaKupon)}
                    >
                      Hapus
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !errorMessage && kupons.length === 0 && (
        <div className="no-kupons-message">
          <p>Belum ada kupon yang tersedia.</p>
        </div>
      )}
    </div>
  );
}