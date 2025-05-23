import React from 'react';
import sampleWishlistData from '../../api/sampleWishlistData';
import KostCard from '../../components/KostCard';
import './RecommendedKosts.css';

const RecommendedKosts = ({ userId }) => {
  // In a real app, this would come from an API call
  const recommendedKosts = sampleWishlistData;

  return (
    <div className="recommended-kosts">
      <h2>Recommended Kosts</h2>
      <div className="kost-grid">
        {recommendedKosts.map(kost => (
          <KostCard key={kost.kostId} kost={kost} userId={userId} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedKosts;
