import React from 'react';
import './LandscapeTravelBooking.css';
import { useNavigate } from 'react-router-dom';

const LandscapeBooking = () => {
  const navigate = useNavigate();
  const handleBookNow = () => {
    navigate('/default-package')
  };

  return (
    <div className="booking-container">
      {/* Background Image */}
      <div className="booking-background"></div>
      
      {/* Content */}
      <div className="booking-overlay">
        <h1>Ready for Your Next Adventure?</h1>
        <p>Discover breathtaking landscapes with our premium travel services</p>
        
        <div className="booking-actions">
          <button 
            className="book-now-btn"
            onClick={handleBookNow}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandscapeBooking;