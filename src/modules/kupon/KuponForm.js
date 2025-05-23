import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createKupon, updateKupon, getKuponById } from '../../api/kuponApi';
import './kuponForm.css';

const KuponForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    namaKupon: '',
    persentase: '',
    masaBerlaku: '',
    deskripsi: '',
    quantity: '',
    kosPemilik: [''] // Initialize with one empty string
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      getKuponById(id)
        .then(kupon => {
          setFormData({
            namaKupon: kupon.namaKupon,
            persentase: kupon.persentase,
            masaBerlaku: kupon.masaBerlaku,
            deskripsi: kupon.deskripsi,
            quantity: kupon.quantity,
            kosPemilik: Array.isArray(kupon.kosPemilik) ? kupon.kosPemilik : ['']
          });
          setLoading(false);
        })
        .catch(err => {
          setError('Gagal memuat data kupon');
          setLoading(false);
        });
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'persentase' || name === 'quantity' ? Number(value) : value
    }));
  };

  const handleKosPemilikChange = (index, value) => {
    const newKosPemilik = [...formData.kosPemilik];
    newKosPemilik[index] = value;
    setFormData(prev => ({
      ...prev,
      kosPemilik: newKosPemilik
    }));
  };

  const addKosPemilik = () => {
    setFormData(prev => ({
      ...prev,
      kosPemilik: [...prev.kosPemilik, '']
    }));
  };

  const removeKosPemilik = (index) => {
    if (formData.kosPemilik.length > 1) {
      const newKosPemilik = formData.kosPemilik.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        kosPemilik: newKosPemilik
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Filter out empty strings and prepare data
    const submitData = {
      ...formData,
      kosPemilik: formData.kosPemilik.filter(id => id.trim() !== '')
    };

    try {
      if (isEditing) {
        await updateKupon(id, submitData);
      } else {
        await createKupon(submitData);
      }
      navigate('/kupon');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Memuat...</div>;

  return (
    <div className="form-container">
      <h1 className="form-title">
        {isEditing ? 'Edit Kupon' : 'Buat Kupon Baru'}
      </h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="kupon-form">
        <div className="form-group">
          <label htmlFor="namaKupon">Nama Kupon</label>
          <input
            type="text"
            id="namaKupon"
            name="namaKupon"
            value={formData.namaKupon}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="persentase">Persentase Diskon</label>
          <input
            type="number"
            id="persentase"
            name="persentase"
            value={formData.persentase}
            onChange={handleChange}
            min="0"
            max="100"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="masaBerlaku">Masa Berlaku</label>
          <input
            type="date"
            id="masaBerlaku"
            name="masaBerlaku"
            value={formData.masaBerlaku}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="deskripsi">Deskripsi</label>
          <textarea
            id="deskripsi"
            name="deskripsi"
            value={formData.deskripsi}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="quantity">Jumlah Kupon</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label>Kost Pemilik (UUID)</label>
          {formData.kosPemilik.map((uuid, index) => (
            <div key={index} className="kost-input-group">
              <input
                type="text"
                value={uuid}
                onChange={(e) => handleKosPemilikChange(index, e.target.value)}
                placeholder="Masukkan UUID Kost"
                pattern="^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
                title="Masukkan UUID yang valid (contoh: 123e4567-e89b-12d3-a456-426614174000)"
                required
              />
              <button
                type="button"
                onClick={() => removeKosPemilik(index)}
                className="remove-kost-button"
                disabled={formData.kosPemilik.length === 1}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addKosPemilik}
            className="add-kost-button"
          >
            + Tambah Kost
          </button>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={() => navigate('/kupon')}>
            Batal
          </button>
          <button type="submit" className="submit-button" disabled={loading}>
            {isEditing ? 'Simpan Perubahan' : 'Buat Kupon'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default KuponForm; 