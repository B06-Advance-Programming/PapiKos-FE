import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchAllKost } from '../../api/kostApi';
import { bulkCheckWishlist } from '../../api/wishlistApi';
import KostCard from '../../components/KostCard';
import './RecommendedKosts.css';

const RecommendedKosts = () => {
    const { roles } = useAuth();
    const [recommendedKosts, setRecommendedKosts] = useState([]);
    const [wishlistStatus, setWishlistStatus] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const isPenyewa = roles.includes('PENYEWA');
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const loadRecommendedKosts = async () => {
            try {
                const data = await fetchAllKost();
                setRecommendedKosts(data);
                
                // If user is penyewa, bulk check wishlist status
                if (isPenyewa && userId && data.length > 0) {
                    const kostIds = data.map(kost => kost.kostID).filter(Boolean);
                    if (kostIds.length > 0) {
                        try {
                            const wishlistResults = await bulkCheckWishlist(userId, kostIds);
                            setWishlistStatus(wishlistResults);
                        } catch (wishlistError) {
                            console.error('Error loading wishlist status:', wishlistError);
                            // Continue without wishlist status rather than failing completely
                        }
                    }
                }
            } catch (err) {
                setError('Gagal memuat rekomendasi kost.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadRecommendedKosts();
    }, [isPenyewa, userId]);

    return (
        <div className="recommended-kosts">
            <h2>Rekomendasi Kost</h2>

            {loading && <p>Memuat rekomendasi...</p>}
            {error && <p className="error-text">{error}</p>}

            {!loading && !error && (
                <div className="kost-grid">
                    {recommendedKosts.length === 0 ? (
                        <p>Tidak ada rekomendasi tersedia.</p>
                    ) : (                        recommendedKosts.map(kost => (
                            <KostCard 
                                key={kost.kostID} 
                                kost={kost} 
                                initialWishlistStatus={wishlistStatus[kost.kostID] || null}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default RecommendedKosts;
