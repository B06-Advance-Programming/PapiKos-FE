// src/components/KuponList.js
import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import {
  getAllKupons,
  deleteKupon,
  getKuponsByOwnerId,
} from "../../api/kuponApi";
import { useAuth } from '../../contexts/AuthContext';
import "./kuponList.css";

export default function KuponList() {
  const [kupons, setKupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { roles, user } = useAuth();

  console.log("Role saat ini:", roles); // Debugging
  const isAdmin = roles.includes("ADMIN");
  const isPemilik = roles.includes("PEMILIK");
  const canEditOrDelete = isAdmin || isPemilik;


  useEffect(() => {
    const fetchKupons = async () => {
      try {
        let data = [];
        if (isPemilik && user?.id) {
          data = await getKuponsByOwnerId(user.id);
        } else {
          data = await getAllKupons();
        }
        setKupons(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchKupons();
  }, [isPemilik, user]);

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kupon ini?')) {
      try {
        await deleteKupon(id);
        setKupons(kupons.filter(k => k.idKupon !== id));
      } catch (e) {
        alert("Gagal menghapus kupon");
      }
    }
  };

  if (loading) return <div>Memuat data...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">Daftar Kupon</h1>
        {canEditOrDelete && (
          <Link to="/kupon/new" className="create-button">
            + Buat Kupon Baru
          </Link>
        )}
      </div>
      <div className="grid">
        {kupons.map((kupon) => (
          <div key={kupon.idKupon} className="card">
            <h3 className="cardTitle">{kupon.namaKupon}</h3>
            <p><strong>Persentase:</strong> {kupon.persentase}%</p>
            <p><strong>Berlaku sampai:</strong> {kupon.masaBerlaku}</p>
            <p><strong>Status:</strong>{" "}
              <span className={kupon.statusKupon === "VALID" ? "status-valid" : "status-invalid"}>
                {kupon.statusKupon}
              </span>
            </p>
            <p><strong>Deskripsi:</strong> {kupon.deskripsi}</p>
            <p><strong>Jumlah:</strong> {kupon.quantity}</p>
            <p>
              <strong>Kost Pemilik:</strong>{" "}
              {kupon.kosPemilik && kupon.kosPemilik.length > 0
                ? kupon.kosPemilik.map(k => k.nama).join(", ")
                : "-"}
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
              <Link
                to={`/kupon/${kupon.idKupon}`}
                className="detailButton"
                style={{ flex: 1, backgroundColor: '#ff6f61' }}
              >
                Detail
              </Link>

              {canEditOrDelete && (
                <>
                  <Link
                    to={`/kupon/${kupon.idKupon}/edit`}
                    className="detailButton"
                    style={{ flex: 1, backgroundColor: '#ffc107' }}
                  >
                    Edit
                  </Link>
                  <button
                    className="detailButton"
                    onClick={() => handleDelete(kupon.idKupon)}
                    style={{ flex: 1, backgroundColor: '#dc3545' }}
                  >
                    Hapus
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}