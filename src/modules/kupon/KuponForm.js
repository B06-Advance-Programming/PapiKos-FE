import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createKupon, updateKupon, getKuponById, getKostByOwner, getAllKost } from '../../api/kuponApi';
import './kuponForm.css';
import { useAuth } from '../../contexts/AuthContext';
import SimpleErrorPopup from './ErrorPopup';

const KuponForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { roles, user } = useAuth();

  const isAdmin = roles.includes("ADMIN");
  const isPemilik = roles.includes("PEMILIK");

  const [formData, setFormData] = useState({
    namaKupon: '',
    persentase: '',
    masaBerlaku: '',
    deskripsi: '',
    quantity: '',
    kosPemilik: ['']
  });

  const [kostOptions, setKostOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [kostLoading, setKostLoading] = useState(true);

  useEffect(() => {
    const fetchKostOptions = async () => {
      if (!user?.id) return;

      try {
        setKostLoading(true);

        let kostData;

        if (isAdmin) {
          kostData = await getAllKost();
        } else if (isPemilik) {
          kostData = await getKostByOwner(user.id);
        } else {
          kostData = [];
        }

        setKostOptions(kostData || []);
        console.log('Kost options loaded:', kostData);
      } catch (err) {
        console.error('Error fetching kost options:', err);
        setErrorMessage('Gagal memuat data kost');
      } finally {
        setKostLoading(false);
      }
    };

    fetchKostOptions();
  }, [user, isAdmin, isPemilik]);

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      getKuponById(id)
        .then(kupon => {
          let kosPemilikArray = [];
          if (Array.isArray(kupon.kosPemilik)) {
            kosPemilikArray = kupon.kosPemilik.map(item =>
              typeof item === 'string' ? item : (item?.toString() || '')
            );
          }
          if (kosPemilikArray.length === 0) {
            kosPemilikArray = [''];
          }

          setFormData({
            namaKupon: kupon.namaKupon || '',
            persentase: kupon.persentase || '',
            masaBerlaku: kupon.masaBerlaku || '',
            deskripsi: kupon.deskripsi || '',
            quantity: kupon.quantity || '',
            kosPemilik: kosPemilikArray
          });
          setLoading(false);
        })
        .catch(err => {
          console.error('Error loading kupon:', err);
          setErrorMessage('Gagal memuat data kupon');
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

  const handleClosePopup = () => {
    setErrorMessage(null);
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

  const getKostNameByUuid = (uuid) => {
    const kost = kostOptions.find(k => k.kostID === uuid || k.id === uuid);
    return kost ? kost.nama || kost.name : 'Kost tidak ditemukan';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const submitData = {
      ...formData,
      kosPemilik: formData.kosPemilik.filter(id => id && typeof id === 'string' && id.trim() !== '')
    };

    const invalidKosts = submitData.kosPemilik.filter(uuid =>
      !kostOptions.some(kost => kost.kostID === uuid || kost.id === uuid)
    );

    if (invalidKosts.length > 0) {
      setErrorMessage('Beberapa kost yang dipilih tidak valid');
      setLoading(false);
      return;
    }

    try {
      if (isEditing) {
        await updateKupon(id, submitData);
      } else {
        await createKupon(submitData);
      }
      navigate('/kupon');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading || kostLoading) {
    return (
      <div className="container kupon-list-page-container">
        <SimpleErrorPopup message={errorMessage} onClose={handleClosePopup} />
        <div>
          <SimpleSkeletonCard />
        </div>
      </div>

    );
  }

  return (
    <div className="form-container">
      <h1 className="form-title">
        {isEditing ? 'Edit Kupon' : 'Buat Kupon Baru'}
      </h1>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

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
          <label>Pilih Kost</label>
          {kostOptions.length === 0 ? (
            <p className="no-kost-message">
              Tidak ada kost yang tersedia. Pastikan Anda sudah memiliki kost yang terdaftar.
            </p>
          ) : (
            <>
              {formData.kosPemilik.map((selectedUuid, index) => (
                <div key={index} className="kost-input-group">
                  <select
                    value={selectedUuid}
                    onChange={(e) => handleKosPemilikChange(index, e.target.value)}
                    required
                    className="kost-select"
                  >
                    <option value="">Pilih Kost...</option>
                    {kostOptions.map((kost) => (
                      <option
                        key={kost.kostID || kost.id}
                        value={kost.kostID || kost.id}
                        disabled={formData.kosPemilik.includes(kost.kostID || kost.id) &&
                          (kost.kostID || kost.id) !== selectedUuid}
                      >
                        {kost.nama || kost.name}
                        {formData.kosPemilik.includes(kost.kostID || kost.id) &&
                          (kost.kostID || kost.id) !== selectedUuid ? ' (Sudah dipilih)' : ''}
                      </option>
                    ))}
                  </select>
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
                disabled={formData.kosPemilik.length >= kostOptions.length}
              >
                + Tambah Kost
              </button>

              {formData.kosPemilik.length >= kostOptions.length && (
                <p className="info-message">
                  Semua kost sudah dipilih
                </p>
              )}
            </>
          )}
        </div>

        {/* Display selected kosts for confirmation */}
        {formData.kosPemilik.some(uuid => uuid && typeof uuid === 'string' && uuid.trim() !== '') && (
          <div className="form-group">
            <label>Kost yang Dipilih:</label>
            <ul className="selected-kosts-list">
              {formData.kosPemilik
                .filter(uuid => uuid && typeof uuid === 'string' && uuid.trim() !== '')
                .map((uuid, index) => (
                  <li key={index} className="selected-kost-item">
                    {getKostNameByUuid(uuid)}
                    <span className="uuid-display">({uuid})</span>
                  </li>
                ))}
            </ul>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={() => navigate('/kupon')}>
            Batal
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={loading || kostOptions.length === 0}
          >
            {isEditing ? 'Simpan Perubahan' : 'Buat Kupon'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default KuponForm;