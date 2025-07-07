import React, { useState, useEffect } from 'react';
import './Vehicle.css';
import Swal from 'sweetalert2';

function Vehicle() {
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: '',
    vehicleModel: '',
    ownerName: '',
    ownerContactNumber: '',
    yearOfManufacture: '',
    fuelType: '',
    licenseExpiryDate: '',
    color: '',
    seatingCapacity: '',
    vehicleFeatures: [],
    isAvailable: true,
    status: 'Available'
  });

  const [vehicleImageFile, setVehicleImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [formIsValid, setFormIsValid] = useState(false);

  // Generate year options for dropdown (from 1900 to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);

  // Get today's date in YYYY-MM-DD format for date input min attribute
  const today = new Date().toISOString().split('T')[0];

  // Validate the entire form whenever formData changes
  useEffect(() => {
    validateForm();
  }, [formData, vehicleImageFile]);

  const validateForm = () => {
    const errors = {};
    
    // Validate vehicle number (Sri Lankan format)
    // Common formats: ABC-1234, AB-1234, ABC-123, 123-1234, etc.
    const vehicleNumberRegex = /^([A-Z]{2,3}-\d{4})|([A-Z]{2,3}-\d{3})|(\d{2,3}-\d{4})$/;
    if (formData.vehicleNumber && !vehicleNumberRegex.test(formData.vehicleNumber.toUpperCase())) {
      errors.vehicleNumber = 'Please enter a valid Sri Lankan vehicle number format (e.g., ABC-1234, AB-1234)';
    }

    // Validate owner contact number (10 digits)
    const contactRegex = /^\d{10}$/;
    if (formData.ownerContactNumber && !contactRegex.test(formData.ownerContactNumber)) {
      errors.ownerContactNumber = 'Contact number must be exactly 10 digits';
    }

    // Validate seating capacity
    const seatingCapacity = parseInt(formData.seatingCapacity);
    if (formData.seatingCapacity !== '') {
      if (isNaN(seatingCapacity) || seatingCapacity <= 0) {
        errors.seatingCapacity = 'Seating capacity must be a positive number';
      } else if (seatingCapacity > 100) {
        errors.seatingCapacity = 'Seating capacity cannot exceed 100';
      }
    }

    // Check if all required fields are filled
    const requiredFields = [
      'vehicleNumber',
      'vehicleType',
      'vehicleModel',
      'ownerName',
      'ownerContactNumber',
      'yearOfManufacture',
      'fuelType',
      'licenseExpiryDate',
      'color',
      'seatingCapacity'
    ];

    const missingRequiredFields = requiredFields.some(field => !formData[field]);
    
    setValidationErrors(errors);
    setFormIsValid(
      Object.keys(errors).length === 0 && 
      !missingRequiredFields && 
      vehicleImageFile !== null
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For vehicle number, convert to uppercase as the user types
    if (name === 'vehicleNumber') {
      setFormData({ ...formData, [name]: value.toUpperCase() });
    } 
    // For seating capacity, prevent negative numbers and non-numeric inputs
    else if (name === 'seatingCapacity') {
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue === '' || parseInt(numericValue) <= 100) {
        setFormData({ ...formData, [name]: numericValue });
      }
    } 
    // For contact number, ensure only digits
    else if (name === 'ownerContactNumber') {
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue.length <= 10) {
        setFormData({ ...formData, [name]: numericValue });
      }
    }
    else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFeatureChange = (feature) => {
    setSelectedFeatures(prev => {
      const newSelected = prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature];
      
      // Update formData with the new selected features
      setFormData(prevData => ({
        ...prevData,
        vehicleFeatures: newSelected
      }));
      
      return newSelected;
    });
  };

  const handleFileChange = (e) => {
    const { files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setVehicleImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Double-check validation before submitting
    validateForm();
    
    if (!formIsValid) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fix all validation errors before submitting.',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const formPayload = new FormData();
      
      // Append all form data with correct field names
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'vehicleFeatures') {
          formPayload.append(key, JSON.stringify(value));
        } else {
          formPayload.append(key, value);
        }
      });

      // Append the image file if it exists
      if (vehicleImageFile) {
        formPayload.append('vehicleImage', vehicleImageFile);
      }

      // Log the form data for debugging
      console.log('Form Data:', Object.fromEntries(formPayload));

      const response = await fetch('http://localhost:5000/vehicle/create', {
        method: 'POST',
        body: formPayload,
      });

      const result = await response.json();
      console.log('Response:', result);

      if (response.ok) {
        Swal.fire({
          title: 'Success!',
          text: 'Vehicle added successfully!',
          icon: 'success',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK'
        }).then(() => {
          // Reset form
          setFormData({
            vehicleNumber: '',
            vehicleType: '',
            vehicleModel: '',
            ownerName: '',
            ownerContactNumber: '',
            yearOfManufacture: '',
            fuelType: '',
            licenseExpiryDate: '',
            color: '',
            seatingCapacity: '',
            vehicleFeatures: [],
            isAvailable: true,
            status: 'Available'
          });
          setVehicleImageFile(null);
          setImagePreview(null);
          setSelectedFeatures([]);
        });
      } else {
        throw new Error(result.message || 'Failed to add vehicle');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error.message || 'An unexpected error occurred. Please try again.');
      Swal.fire({
        title: 'Error!',
        text: error.message || 'An unexpected error occurred. Please try again.',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="vehicle-form-container">
      <h2 className="vehicle-form-title">Add New Vehicle</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="vehicle-form-group">
          <label>Vehicle Number: <small>(Format: ABC-1234)</small></label>
          <input
            type="text"
            name="vehicleNumber"
            value={formData.vehicleNumber}
            onChange={handleChange}
            placeholder="ABC-1234"
            required
          />
          {validationErrors.vehicleNumber && (
            <span className="validation-error">{validationErrors.vehicleNumber}</span>
          )}
        </div>

        <div className="vehicle-form-group">
          <label>Vehicle Type:</label>
          <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} required>
            <option value="">Select Type</option>
            <option value="car">Car (1-2 travelers)</option>
            <option value="mini-van">Mini Van (1-5 travelers)</option>
            <option value="van">Van (4-8 travelers)</option>
            <option value="mini-bus">Mini Bus (8-20 travelers)</option>
            <option value="king-long-bus">King Long Bus (10-40 travelers)</option>
          </select>
        </div>

        <div className="vehicle-form-group">
          <label>Vehicle Model:</label>
          <input
            type="text"
            name="vehicleModel"
            value={formData.vehicleModel}
            onChange={handleChange}
            required
          />
        </div>

        <div className="vehicle-form-group">
          <label>Owner Name:</label>
          <input
            type="text"
            name="ownerName"
            value={formData.ownerName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="vehicle-form-group">
          <label>Owner Contact Number: <small>(10 digits)</small></label>
          <input
            type="tel"
            name="ownerContactNumber"
            value={formData.ownerContactNumber}
            onChange={handleChange}
            placeholder="0712345678"
            maxLength={10}
            required
          />
          {validationErrors.ownerContactNumber && (
            <span className="validation-error">{validationErrors.ownerContactNumber}</span>
          )}
        </div>

        <div className="vehicle-form-group">
          <label>Year of Manufacture:</label>
          <select 
            name="yearOfManufacture" 
            value={formData.yearOfManufacture} 
            onChange={handleChange}
            required
          >
            <option value="">Select Year</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="vehicle-form-group">
          <label>Fuel Type:</label>
          <select name="fuelType" value={formData.fuelType} onChange={handleChange} required>
            <option value="">Select Fuel Type</option>
            <option value="Diesel">Diesel</option>
            <option value="Petrol">Petrol</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        <div className="vehicle-form-group">
          <label>License Expiry Date:</label>
          <input
            type="date"
            name="licenseExpiryDate"
            value={formData.licenseExpiryDate}
            onChange={handleChange}
            min={today}
            required
          />
        </div>

        <div className="vehicle-form-group">
          <label>Color:</label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            required
          />
        </div>

        <div className="vehicle-form-group">
          <label>Seating Capacity: <small>(Max 100)</small></label>
          <input
            type="text"
            name="seatingCapacity"
            value={formData.seatingCapacity}
            onChange={handleChange}
            min="1"
            max="100"
            required
          />
          {validationErrors.seatingCapacity && (
            <span className="validation-error">{validationErrors.seatingCapacity}</span>
          )}
        </div>

        <div className="vehicle-form-group">
          <label>Status:</label>
          <select name="status" value={formData.status} onChange={handleChange} required>
            <option value="Available">Available</option>
            <option value="Not Available">Not Available</option>
            <option value="Under Maintenance">Under Maintenance</option>
          </select>
        </div>

        <div className="vehicle-form-group">
          <label>Vehicle Features:</label>
          <div className="vehicle-checkbox-group" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '15px', 
            marginTop: '15px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '2px solid #969696'
          }}>
            {[
              'Air Conditioning (A/C)',
              'Comfortable Seats',
              'Wi-Fi',
              'Reclining Seats',
              'USB Charging Ports',
              'Seat Belts for All Passengers',
              'TV',
              'Interior Lighting',
              'Sound System'
            ].map((feature) => (
              <label key={feature} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                padding: '8px',
                backgroundColor: 'white',
                borderRadius: '4px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #969696'
              }}>
                <input
                  type="checkbox"
                  checked={selectedFeatures.includes(feature)}
                  onChange={() => handleFeatureChange(feature)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontSize: '14px' }}>{feature}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="vehicle-form-group">
          <label>Vehicle Image:</label>
          <input
            type="file"
            name="vehicleImage"
            accept="image/*"
            onChange={handleFileChange}
            required
          />
          {imagePreview && (
            <div className="image-preview-container">
              <img 
                src={imagePreview} 
                alt="Vehicle preview" 
                className="image-preview"
              />
            </div>
          )}
        </div>

        {errorMessage && <div className="vehicle-error-message">{errorMessage}</div>}

        <button 
          type="submit" 
          className="vehicle-submit-btn"
          disabled={isSubmitting || !formIsValid}
        >
          {isSubmitting ? 'Adding Vehicle...' : 'Add Vehicle'}
        </button>
      </form>
    </div>
  );
}

export default Vehicle;