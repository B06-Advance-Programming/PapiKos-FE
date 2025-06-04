import './ErrorPopup.css';

const SimpleErrorPopup = ({ message, onClose }) => {
  if (!message) {
    return null;
  }
  return (
    <div className="simple-popup-overlay">
      <div className="simple-popup-content">
        <h4>Terjadi Kesalahan</h4>
        <p>{message}</p>
        <button onClick={onClose}>Tutup</button>
      </div>
    </div>
  );
};

export default SimpleErrorPopup;