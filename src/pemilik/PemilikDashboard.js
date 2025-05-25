import React, { useEffect, useState } from 'react';
import { deleteKost, fetchKostByOwnerId, editKost, addKost } from '../api/kostApi';
import { fetchCurrentUser } from '../api/userMe';
import './PemilikDashboard.css';

const KostForm = ({ kostData, onChange, onSubmit, onCancel, submitText }) => (
    <form onSubmit={onSubmit}>
        <label>
            Nama:
            <input
                type="text"
                name="nama"
                value={kostData.nama}
                onChange={onChange}
                required
            />
        </label>
        <label>
            Alamat:
            <input
                type="text"
                name="alamat"
                value={kostData.alamat}
                onChange={onChange}
                required
            />
        </label>
        <label>
            Deskripsi:
            <textarea
                name="deskripsi"
                value={kostData.deskripsi}
                onChange={onChange}
                required
            />
        </label>
        <label>
            Jumlah Kamar:
            <input
                type="number"
                name="jumlahKamar"
                min="1"
                value={kostData.jumlahKamar}
                onChange={onChange}
                required
            />
        </label>
        <label>
            Harga per Bulan:
            <input
                type="number"
                name="hargaPerBulan"
                min="1"
                value={kostData.hargaPerBulan}
                onChange={onChange}
                required
            />
        </label>
        <div className="edit-buttons">
            <button type="submit" className="edit-button">{submitText}</button>
            <button type="button" className="delete-button" onClick={onCancel}>Batal</button>
        </div>
    </form>
);

const PemilikDashboard = () => {
    const [kostList, setKostList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingKost, setEditingKost] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newKostData, setNewKostData] = useState({
        nama: "",
        alamat: "",
        deskripsi: "",
        jumlahKamar: 1,
        hargaPerBulan: 1
    });

    const resetNewKostData = () => {
        setNewKostData({
            nama: "",
            alamat: "",
            deskripsi: "",
            jumlahKamar: 1,
            hargaPerBulan: 1
        });
    };

    useEffect(() => {
        const loadKostData = async () => {
            try {
                const user = await fetchCurrentUser();
                if (!user) throw new Error('User tidak ditemukan');

                const data = await fetchKostByOwnerId(user.id);
                setKostList(data);
            } catch (error) {
                console.error('Gagal memuat data kost:', error);
            } finally {
                setLoading(false);
            }
        };

        loadKostData();
    }, []);

    const handleEdit = (kost) => {
        setEditingKost({ ...kost });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        if (['jumlahKamar', 'hargaPerBulan'].includes(name)) {
            const intValue = Math.max(1, parseInt(value) || 1);
            setEditingKost(prev => ({ ...prev, [name]: intValue }));
        } else {
            setEditingKost(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleNewKostChange = (e) => {
        const { name, value } = e.target;
        if (['jumlahKamar', 'hargaPerBulan'].includes(name)) {
            const intValue = Math.max(1, parseInt(value) || 1);
            setNewKostData(prev => ({ ...prev, [name]: intValue }));
        } else {
            setNewKostData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const success = await editKost(editingKost.kostID, editingKost);
        if (success) {
            setKostList(prevList =>
                prevList.map(kost => kost.kostID === editingKost.kostID ? editingKost : kost)
            );
            alert('Kost berhasil diupdate');
            setEditingKost(null);
        } else {
            alert('Gagal mengupdate kost');
        }
    };

    const handleDelete = async (kostId) => {
        const confirmed = window.confirm('Yakin ingin menghapus kost ini?');
        if (confirmed) {
            const success = await deleteKost(kostId);
            if (success) {
                setKostList(prevList => prevList.filter(kost => kost.kostID !== kostId));
                alert('Kost berhasil dihapus');
            } else {
                alert('Gagal menghapus kost');
            }
        }
    };

    const handleAddKost = async () => {
        try {
            const user = await fetchCurrentUser();
            const kostToAdd = {
                ...newKostData,
                ownerId: user.id
            };

            const addedKost = await addKost(kostToAdd);

            if (!addedKost) {
                alert("Gagal membuat kost.");
                return;
            }

            const updatedList = await fetchKostByOwnerId(user.id);
            setKostList(updatedList);

            setShowAddModal(false);
            resetNewKostData();
        } catch (err) {
            console.error("Error saat menambahkan kost:", err);
            alert("Terjadi kesalahan saat menambahkan kost.");
        }
    };

    const createKostCard = (kost) => (
        <div key={kost.kostID} className="kost-card">
            <h3 className="kost-name">{kost.nama}</h3>
            <p><strong>Alamat:</strong> {kost.alamat}</p>
            <p><strong>Deskripsi:</strong> {kost.deskripsi}</p>
            <p><strong>Jumlah Kamar:</strong> {kost.jumlahKamar}</p>
            <p><strong>Harga per Bulan:</strong> Rp {kost.hargaPerBulan.toLocaleString('id-ID')}</p>
            <div className="action-buttons">
                <button className="edit-button" onClick={() => handleEdit(kost)}>Edit</button>
                <button className="delete-button" onClick={() => handleDelete(kost.kostID)}>Delete</button>
            </div>
        </div>
    );

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">Dashboard Pemilik Kost</h2>

            {loading ? (
                <div className="loading-text">Memuat data kost...</div>
            ) : kostList.length === 0 ? (
                <div className="empty-state">
                    <div className="add-kost-wrapper">
                        <button className="add-kost-button" onClick={() => setShowAddModal(true)}>Buat Kost</button>
                    </div>
                    <p>Tidak ada kost yang ditemukan.</p>
                </div>
            ) : (
                <div className="kost-grid">
                    {kostList.map(kost => createKostCard(kost))}
                </div>
            )}

            {showAddModal && (
                <div className="edit-modal">
                    <div className="edit-form">
                        <h3>Tambah Kost Baru</h3>
                        <KostForm
                            kostData={newKostData}
                            onChange={handleNewKostChange}
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleAddKost();
                            }}
                            onCancel={() => {
                                setShowAddModal(false);
                                resetNewKostData();
                            }}
                            submitText="Simpan"
                        />
                    </div>
                </div>
            )}

            {editingKost && (
                <div className="edit-modal">
                    <div className="edit-form">
                        <h3>Edit Kost</h3>
                        <KostForm
                            kostData={editingKost}
                            onChange={handleEditChange}
                            onSubmit={handleEditSubmit}
                            onCancel={() => setEditingKost(null)}
                            submitText="Simpan"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PemilikDashboard;
