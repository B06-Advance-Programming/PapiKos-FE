import React, { useEffect, useState } from 'react';
import { fetchAllKost } from '../../api/kostApi';
import KostCard from '../../components/KostCard';
import './RecommendedKosts.css';

const RecommendedKosts = () => {
    const [recommendedKosts, setRecommendedKosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadRecommendedKosts = async () => {
            try {
                const data = await fetchAllKost();
                setRecommendedKosts(data);
            } catch (err) {
                setError('Gagal memuat rekomendasi kost.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadRecommendedKosts(); // langsung panggil tanpa kondisi userId
    }, []);

    return (
        <div className="recommended-kosts">
            <h2>Rekomendasi Kost</h2>

            {loading && <p>Memuat rekomendasi...</p>}
            {error && <p className="error-text">{error}</p>}

            {!loading && !error && (
                <div className="kost-grid">
                    {recommendedKosts.length === 0 ? (
                        <p>Tidak ada rekomendasi tersedia.</p>
                    ) : (
                        recommendedKosts.map(kost => (
                            <KostCard key={kost.kostID} kost={kost} />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default RecommendedKosts;
