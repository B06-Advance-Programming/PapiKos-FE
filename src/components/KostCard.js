import React from 'react';
import { Link } from 'react-router-dom';
import AddToWishlistButton from './wishlist/AddToWishlistButton';
import './KostCard.css';

const KostCard = ({ kost, userId }) => {
  return (
    <div className="kost-card">
      <div className="kost-card-image">
        <img src={kost.imageUrl || 'https://via.placeholder.com/300x200'} alt={kost.name} />
        <div className="wishlist-button-container">
          <AddToWishlistButton kostId={kost.kostId} userId={userId} />
        </div>
      </div>
      <div className="kost-card-content">
        <h3 className="kost-name">{kost.name}</h3>
        <p className="kost-location">{kost.location}</p>
        <p className="kost-price">Rp {kost.price.toLocaleString('id-ID')} / bulan</p>
        <div className="kost-details">
          <span>{kost.roomType}</span>
          <span>•</span>
          <span>{kost.roomSize} m²</span>
        </div>
        <Link to={`/kost/${kost.kostId}`} className="view-details-button">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default KostCard;
