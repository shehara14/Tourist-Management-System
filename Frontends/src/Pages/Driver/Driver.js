import React, { useState, useEffect } from 'react';
import './Driver.css';
import Swal from 'sweetalert2';

function Driver() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    nic: '',
    email: '',
    gender: '',
    dateOfBirth: '',
    languages: '',
    driversLicenseNumber: '',
    licenseExpiryDate: '',
    licenseCategory: ''
  });

  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedLicenseCategories, setSelectedLicenseCategories] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [driverPictureFile, setDriverPictureFile] = useState(null);
  const [licenseCopyFile, setLicenseCopyFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [maxDate, setMaxDate] = useState('');

  // Calculate max date of birth (18 years ago from today)
  useEffect(() => {
    const today = new Date();
    const eighteenYearsAgo = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
    
    // Format as YYYY-MM-DD for input[type="date"]
    const formattedDate = eighteenYearsAgo.toISOString().split('T')[0];
    setMaxDate(formattedDate);
  }, []);

  const validatePhone = (phone) => {
    return /^[0-9]{10}$/.test(phone);
  };

  const validateNIC = (nic) => {
    // 12 digits OR 9 digits followed by V/v
    return /^[0-9]{12}$/.test(nic) || /^[0-9]{9}[Vv]$/.test(nic);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateLicenseNumber = (licenseNumber) => {
    // Sri Lankan driving license format: B1234567
    // One letter followed by 7 digits
    return /^[A-Za-z][0-9]{7}$/.test(licenseNumber);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle specific input restrictions
    if (name === 'phone' && !/^\d*$/.test(value)) {
      // Only allow digits for phone
      return;
    }
    
    if (name === 'nic') {
      // For NIC: Allow only digits and V/v at the end
      if (!/^(\d*|(\d{9}[Vv]?))$/.test(value)) {
        return;
      }
    }
    
    if (name === 'driversLicenseNumber') {
      // For license: Allow only 1 letter followed by digits
      if (!/^([A-Za-z](\d*)?)$/.test(value) && value !== '') {
        return;
      }
    }
    
    setFormData({ ...formData, [name]: value });
    
    // Clear specific field error when user starts typing again
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: ''
      });
    }
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguages(prev => {
      const newSelected = prev.includes(language)
        ? prev.filter(lang => lang !== language)
        : [...prev, language];
      
      // Update formData with the new selected languages
      setFormData(prevData => ({
        ...prevData,
        languages: newSelected.join(', ')
      }));
      
      return newSelected;
    });
  };

  const handleLicenseCategoryChange = (category) => {
    setSelectedLicenseCategories(prev => {
      const newSelected = prev.includes(category)
        ? prev.filter(cat => cat !== category)
        : [...prev, category];
      
      // Update formData with the new selected categories
      setFormData(prevData => ({
        ...prevData,
        licenseCategory: newSelected.join(', ')
      }));
      
      return newSelected;
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      if (name === 'driverPicture') {
        setDriverPictureFile(files[0]);
      } else if (name === 'licenseCopy') {
        setLicenseCopyFile(files[0]);
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Phone validation
    if (!validatePhone(formData.phone)) {
      errors.phone = 'Phone number must be exactly 10 digits';
      isValid = false;
    }

    // NIC validation
    if (!validateNIC(formData.nic)) {
      errors.nic = 'NIC must be 12 digits or 9 digits followed by V/v';
      isValid = false;
    }

    // Email validation
    if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // License number validation
    if (!validateLicenseNumber(formData.driversLicenseNumber)) {
      errors.driversLicenseNumber = 'License number must be 1 letter followed by 7 digits (e.g., B1234567)';
      isValid = false;
    }

    // File uploads
    if (!driverPictureFile) {
      errors.driverPicture = 'Driver picture is required';
      isValid = false;
    }

    if (!licenseCopyFile) {
      errors.licenseCopy = 'License copy is required';
      isValid = false;
    }

    // Required fields
    if (!formData.name) {
      errors.name = 'Name is required';
      isValid = false;
    }

    if (!formData.gender) {
      errors.gender = 'Gender is required';
      isValid = false;
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
      isValid = false;
    }

    if (!formData.licenseExpiryDate) {
      errors.licenseExpiryDate = 'License expiry date is required';
      isValid = false;
    }

    // Set the errors
    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!validateForm()) {
      setErrorMessage('Please correct the errors in the form');
      return;
    }
    
    try {
      setSubmitting(true);
      setErrorMessage('');
      
      const formPayload = new FormData();
      
      // Append all text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formPayload.append(key, value);
        }
      });
      
      // Explicitly append files with proper naming
      if (driverPictureFile) {
        formPayload.append('driverPicture', driverPictureFile, driverPictureFile.name);
      }
      
      if (licenseCopyFile) {
        formPayload.append('licenseCopy', licenseCopyFile, licenseCopyFile.name);
      }
      
      // Log the FormData contents for debugging (won't show in production)
      console.log('Submitting form with files:', driverPictureFile, licenseCopyFile);
      
      const response = await fetch('http://localhost:5000/driver/create', {
        method: 'POST',
        body: formPayload,
        // Don't set Content-Type header when using FormData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        Swal.fire({
          title: 'Success!',
          text: 'Driver added successfully!',
          icon: 'success',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK'
        }).then(() => {
          // Reset form
          setFormData({
            name: '',
            phone: '',
            nic: '',
            email: '',
            gender: '',
            dateOfBirth: '',
            languages: '',
            driversLicenseNumber: '',
            licenseExpiryDate: '',
            licenseCategory: ''
          });
          setSelectedLanguages([]);
          setSelectedLicenseCategories([]);
          setDriverPictureFile(null);
          setLicenseCopyFile(null);
          setFieldErrors({});
          
          // Reset file inputs by clearing their values
          const fileInputs = document.querySelectorAll('input[type="file"]');
          fileInputs.forEach(input => {
            input.value = '';
          });
        });
      } else {
        console.error('Server error:', result);
        setErrorMessage(result.message || result.error || 'Error adding driver');
      }
    } catch (error) {
      console.error('Client error:', error);
      setErrorMessage('An unexpected error occurred: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="driver-form-container">
      <h2 className="driver-form-title">Join as a Registered Driver</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="driver-form-group">
          <label>Full Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
        </div>

        <div className="driver-form-group">
          <label>Phone Number:</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="10 digits only"
            maxLength={10}
            pattern="[0-9]{10}"
          />
          {fieldErrors.phone && <div className="field-error">{fieldErrors.phone}</div>}
        </div>

        <div className="driver-form-group">
          <label>NIC:</label>
          <input
            type="text"
            name="nic"
            value={formData.nic}
            onChange={handleChange}
            required
            placeholder="12 digits or 9 digits+V"
            maxLength={12}
          />
          {fieldErrors.nic && <div className="field-error">{fieldErrors.nic}</div>}
        </div>

        <div className="driver-form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
        </div>

        <div className="driver-form-group">
          <label>Gender:</label>
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {fieldErrors.gender && <div className="field-error">{fieldErrors.gender}</div>}
        </div>

        <div className="driver-form-group">
          <label>Date of Birth:</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
            max={maxDate}
          />
          {fieldErrors.dateOfBirth && <div className="field-error">{fieldErrors.dateOfBirth}</div>}
          <div className="field-hint">You must be at least 18 years old</div>
        </div>

        <div className="driver-form-group">
          <label><b>Languages you can speak?</b></label>
          <div className="driver-checkbox-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '10px' }}>
            {['English', 'Tamil', 'Hindi', 'Chinese', 'French', 'Russian', 'Japanese', 'Korean'].map((language) => (
              <label key={language} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={selectedLanguages.includes(language)}
                  onChange={() => handleLanguageChange(language)}
                />
                {language}
              </label>
            ))}
          </div>
        </div>

        <div className="driver-form-group">
          <label>Driver's License Number:</label>
          <input
            type="text"
            name="driversLicenseNumber"
            value={formData.driversLicenseNumber}
            onChange={handleChange}
            required
            placeholder="Format: B1234567"
            maxLength={8}
          />
          {fieldErrors.driversLicenseNumber && <div className="field-error">{fieldErrors.driversLicenseNumber}</div>}
        </div>

        <div className="driver-form-group">
          <label>License Expiry Date:</label>
          <input
            type="date"
            name="licenseExpiryDate"
            value={formData.licenseExpiryDate}
            onChange={handleChange}
            required
            min={new Date().toISOString().split('T')[0]}
          />
          {fieldErrors.licenseExpiryDate && <div className="field-error">{fieldErrors.licenseExpiryDate}</div>}
        </div>

        <div className="driver-form-group">
          <label>License Category:</label>
          <div className="driver-checkbox-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '10px' }}>
            {[
              'A – Motor bicycles',
              'B – Motor cars',
              'C1 – Light lorries/vans',
              'C – Heavy lorries',
              'D1 – Light buses',
              'D – Heavy buses',
              'G – Three wheelers'
            ].map((category) => (
              <label key={category} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={selectedLicenseCategories.includes(category)}
                  onChange={() => handleLicenseCategoryChange(category)}
                />
                {category}
              </label>
            ))}
          </div>
        </div>

        <div className="driver-form-group">
          <label>Driver Picture:</label>
          <input
            type="file"
            name="driverPicture"
            accept="image/*"
            onChange={handleFileChange}
            required
          />
          {driverPictureFile && (
            <div className="file-preview">
              Selected: {driverPictureFile.name}
            </div>
          )}
          {fieldErrors.driverPicture && <div className="field-error">{fieldErrors.driverPicture}</div>}
        </div>

        <div className="driver-form-group">
          <label>License Copy:</label>
          <input
            type="file"
            name="licenseCopy"
            accept="image/*"
            onChange={handleFileChange}
            required
          />
          {licenseCopyFile && (
            <div className="file-preview">
              Selected: {licenseCopyFile.name}
            </div>
          )}
          {fieldErrors.licenseCopy && <div className="field-error">{fieldErrors.licenseCopy}</div>}
        </div>

        {errorMessage && (
          <div className="driver-error-message" style={{ color: 'red', marginTop: '10px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
            {errorMessage}
          </div>
        )}

        <button 
          type="submit" 
          className="driver-submit-btn" 
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Add Driver'}
        </button>
      </form>
    </div>
  );
}

export default Driver;