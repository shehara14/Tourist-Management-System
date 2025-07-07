import React, { useState, useEffect } from 'react';
import './DefaultPackage.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function DefaultPackage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    numberOfTravelers: '',
    packageName: '',
    departureDate: '',
    returnDate: '',
    preferredTime: '',
    vehicle: '',
    vehicleId: '',
    vehicleType: '',
    pickupLocation: '',
    dropOffLocation: '',
    luggageDetails: '',
    childSeat: '',
    driverLanguage: '',
    customLanguage: '',
    specialRequest: '',
    driverId: '',
  });

  // State for available vehicles and drivers
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Vehicle capacity mapping
  const vehicleCapacityMap = {
    'car': '(1-2 travelers)',
    'mini van': '(1-5 travelers)',
    'van': '(4-8 travelers)',
    'mini bus': '(8-20 travelers)',
    'king long bus': '(10-40 travelers)',
    'bus': '(50 travelers)',
    'mini-bus': '(30 travelers)', 
  };

  // Fetch available vehicles when component mounts
  useEffect(() => {
    fetchAvailableVehicles();
  }, []);

  // Fetch vehicles that are available
  const fetchAvailableVehicles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/vehicle/available');
      const result = await response.json();
      
      if (response.ok) {
        setAvailableVehicles(result.data || []);
      } else {
        console.error('Error fetching vehicles:', result);
        setErrorMessage('Could not load available vehicles.');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setErrorMessage('Network error while loading vehicles.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch driver assigned to the selected vehicle
  const fetchAssignedDriver = async (vehicleId) => {
    if (!vehicleId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/assignments/vehicle/${vehicleId}`);
      const result = await response.json();
      
      if (response.ok && result.data && result.data.length > 0) {
        // Find active assignment
        const activeAssignment = result.data.find(assignment => assignment.isActive);
        
        if (activeAssignment && activeAssignment.driver) {
          // Get driver details using the correct API endpoint based on your routes
          const driverResponse = await fetch(`http://localhost:5000/driver/driver/${activeAssignment.driver._id}`);
          const driverResult = await driverResponse.json();
          
          if (driverResponse.ok) {
            setSelectedDriver(driverResult.data);
            
            // Set driver languages - parse them properly
            const driverLanguages = driverResult.data.languages.split(',').map(lang => lang.trim());
            
            // Update the selected languages array
            setSelectedLanguages(driverLanguages);
            
            // Update form data with driver information
            setFormData(prev => ({
              ...prev,
              driverLanguage: driverLanguages.join(', '),
              driverId: driverResult.data._id
            }));
            
            console.log('Driver languages set:', driverLanguages);
          }
        } else {
          setSelectedDriver(null);
          setSelectedLanguages([]);
          setFormData(prev => ({
            ...prev,
            driverLanguage: '',
            driverId: ''
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching driver:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // If vehicle selection changes, fetch the assigned driver
    if (name === 'vehicle' && value) {
      const [vehicleId, vehicleType] = value.split('|');
      setFormData(prev => ({
        ...prev,
        vehicle: value,
        vehicleId: vehicleId,
        vehicleType: vehicleType
      }));
      
      // Clear current selections before fetching new driver
      setSelectedLanguages([]);
      fetchAssignedDriver(vehicleId);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullName = `${formData.firstName} ${formData.lastName}`;

    try {
      // First, create the booking
      const bookingResponse = await fetch('http://localhost:5000/defaultPackage/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          fullName,
          vehicleId: formData.vehicleId,
          driverId: formData.driverId
        }),
      });

      const bookingResult = await bookingResponse.json();
      
      if (bookingResponse.ok) {
        // Now update the vehicle availability to false
        const updateVehicleResponse = await fetch(`http://localhost:5000/vehicle/edit/${formData.vehicleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            isAvailable: false 
          }),
        });
        
        const updateVehicleResult = await updateVehicleResponse.json();
        
        if (!updateVehicleResponse.ok) {
          console.warn('Failed to update vehicle availability:', updateVehicleResult);
          // Continue with success flow even if vehicle update fails
        }
        
        Swal.fire({
          title: 'Success!',
          html: "Your booking is successfully completed.<br> We'll be sending your tour details to you shortly.",
          icon: 'success',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK'
        }).then(() => {
          // Store the email in localStorage for future reference
          localStorage.setItem('userEmail', formData.email);
          
          // Navigate to booking details with the current booking data
          navigate('/bookingdetails', { 
            state: { 
              currentBooking: { ...formData, fullName, _id: bookingResult.data._id },
              isNewBooking: true 
            } 
          });
        });
      } else {
        console.error('Booking error:', bookingResult);
        setErrorMessage('Error during booking.');
      }      
    } catch (error) {
      console.error('Fetch error:', error);
      setErrorMessage('An unexpected error occurred.');
    }
  };

  const handleViewDashboard = () => {
    navigate('/dashboard');
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

  // Group vehicles by type for better organization in dropdown
  const vehiclesByType = availableVehicles.reduce((acc, vehicle) => {
    const type = vehicle.vehicleType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(vehicle);
    return acc;
  }, {});

  return (
        <div className="default-package-page">
    <div className="dp-form-container">
      <div className="dp-header">
        <h2 className="dp-form-title">Book Your Tour Package</h2>
      </div>
     
      <p className="dp-form-description">
        Plan your trip effortlessly! Fill in your details below to book your preferred tour package.<br />
        Select your vehicle, travel dates, and let us handle the rest for a smooth journey!
      </p>

      {isLoading && <div className="dp-loading">Loading...</div>}

      <form onSubmit={handleSubmit}>
        {/* First & Last Name */}
        <div className="dp-form-group name-group">
          <label>Full Name :</label>
          <div className="dp-name-inputs">
            <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
            <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
          </div>
        </div>

        {/* Other Fields */}
        {[
          { label: 'Email', name: 'email', type: 'email', placeholder: 'Enter your email address' },
          { label: 'Contact Number', name: 'contactNumber', type: 'text', placeholder: 'Enter your phone number', pattern: '[+@0-9]+' },
          { label: 'Number of Travelers', name: 'numberOfTravelers', type: 'number', placeholder: 'Enter the number of people', min: '1' },
          { label: 'Package Name', name: 'packageName', type: 'text', placeholder: 'Enter your tour package' }
        ].map((field, index) => (
          <div className="dp-form-group" key={index}>
            <label>{field.label} :</label>
            <input 
              {...field} 
              value={formData[field.name]} 
              onChange={handleChange} 
              required 
              onInput={field.name === "numberOfTravelers" ? (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '').replace(/^0+/, '');
              } : null} 
            />
          </div>
        ))}

        <div className="dp-form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <label>Departure Date :</label>
          <input
            type="date"
            name="departureDate"
            value={formData.departureDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required
            style={{ flex: 1 }}
          />

          <label>Return Date :</label>
          <input
            type="date"
            name="returnDate"
            value={formData.returnDate}
            onChange={handleChange}
            min={formData.departureDate ? formData.departureDate : new Date().toISOString().split('T')[0]}
            required
            style={{ flex: 1 }}
            disabled={!formData.departureDate} // Disable return date until departure date is selected
          />
        </div>

        {/* Preferred Time */}
        <div className="dp-form-group">
          <label>Preferred Time :</label>
          <input type="time" name="preferredTime" value={formData.preferredTime} onChange={handleChange} required />
        </div>

        {/* Enhanced Vehicle Selection with vehicle type, model, number and passenger capacity */}
        <div className="dp-form-group">
          <label>Vehicle :</label>
          <select 
            name="vehicle" 
            value={formData.vehicle} 
            onChange={handleChange} 
            required
          >
            <option value="">Select your vehicle</option>
            {Object.entries(vehiclesByType).map(([type, vehicles]) => {
              // Only display vehicle types that have available vehicles
              if (vehicles.length === 0) return null;
              
              // Get the capacity text for this vehicle type
              const capacityText = vehicleCapacityMap[type.toLowerCase()] || '';
              return (
                <optgroup 
                  label={`${type.charAt(0).toUpperCase() + type.slice(1)} ${capacityText}`} 
                  key={type}
                >
                  {vehicles.map(vehicle => (
                    <option 
                      key={vehicle._id} 
                      value={`${vehicle._id}|${vehicle.vehicleType}`}
                    >
                      {vehicle.vehicleModel} ({vehicle.vehicleNumber})
                      {vehicle.vehicleFeatures.includes('AC') ? ' (AC)' : ' (Non-AC)'}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
          {availableVehicles.length === 0 && !isLoading && 
            <div className="dp-no-vehicles-message" style={{ marginTop: '5px', color: 'red' }}>
              No vehicles are currently available for booking
            </div>
          }
        </div>

        {/* Display selected driver information if available */}
        {selectedDriver && (
          <div className="dp-driver-info">
            <h4>Driver Information:</h4>
            <p><strong>Name:</strong> {selectedDriver.name}</p>
            <p><strong>Languages:</strong> {selectedDriver.languages}</p>
          </div>
        )}

        {/* Other fields */}        
        {[
          { label: 'Pickup Location', name: 'pickupLocation', placeholder: 'Enter your pickup address' },
          { label: 'Drop Off Location', name: 'dropOffLocation', placeholder: 'Enter your drop-off location' },
        ].map((field, idx) => (
          <div className="dp-form-group" key={idx}>
            <label>{field.label} :</label>
            <input
              type="text"
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder} 
              required
            />
          </div>
        ))}

        {/* Luggage Details */}
        <div className="dp-form-group">
          <label>Luggage Details :</label>
          <select name="luggageDetails" value={formData.luggageDetails} onChange={handleChange} required>
            <option value="">Select luggage size</option>
            <option value="None">None - No extra luggage</option>
            <option value="Small">Small (Backpack, Handbag)</option>
            <option value="Medium">Medium (Carry-on, Duffle Bag)</option>
            <option value="Large">Large (Suitcase, Oversized Bags)</option>
          </select>
        </div>

        {/* Child Seat Required */}
        <div className="dp-form-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '70px', marginBottom: '10px' }}>
            <label>Child Seat Required? :</label>
            <div className="dp-radio-group" style={{ display: 'flex', gap: '75px' }}>
              <label>
                <input type="radio" name="childSeat" value="Yes" onChange={handleChange} checked={formData.childSeat === "Yes"} />
                Yes
              </label>
              <label>
                <input type="radio" name="childSeat" value="No" onChange={handleChange} checked={formData.childSeat === "No"} />
                No
              </label>
            </div>
          </div>
        </div>

        {/* Driver Language Preferences - Now auto-selects based on driver and freezes options*/}
        <div className="dp-form-group">
          <label>Driver Languages:</label>
          <div className="dp-checkbox-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '10px' }}>
            {['English', 'Tamil', 'Hindi', 'Chinese', 'French', 'Russian', 'Japanese', 'Korean'].map((language) => {
              // Check if this language is one of the driver's languages
              const isDriverLanguage = selectedDriver && selectedLanguages.some(lang => 
                lang.toLowerCase() === language.toLowerCase() ||
                lang.toLowerCase().includes(language.toLowerCase())
              );
              
              return (
                <label 
                  key={language} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    opacity: selectedDriver ? (isDriverLanguage ? '1' : '0.5') : '1'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isDriverLanguage}
                    onChange={() => {
                      // Only allow changes if no driver is selected
                      if (!selectedDriver) {
                        handleLanguageChange(language);
                      }
                    }}
                    disabled={selectedDriver !== null} // Freeze checkboxes when a driver is selected
                  />
                  {language}
                </label>
              );
            })}
          </div>
          {selectedDriver && (
            <div className="dp-language-note" style={{ marginTop: '5px', fontSize: '0.9em', color: '#666' }}>
              <em>* Languages are automatically selected based on driver {selectedDriver.name}'s proficiency</em>
            </div>
          )}
        </div>

        {/* Special Request */}
        <div className="dp-form-group dp-full-width">
          <label>Special Request:</label>
          <textarea
            name="specialRequest"
            placeholder="Enter any special requests"
            value={formData.specialRequest}
            onChange={handleChange}
          ></textarea>
        </div>
        
        {errorMessage && <div className="dp-error-message">{errorMessage}</div>}

        <div className="dp-button-group">
          <button 
            type="submit" 
            className="dp-submit-btn"
            disabled={availableVehicles.length === 0} // Disable submission if no vehicles available
          >
            Submit
          </button>
        </div>
      </form>
    </div>
        </div>

  );
}

export default DefaultPackage;

