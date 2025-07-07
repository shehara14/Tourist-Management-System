import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { FaCar, FaUser, FaCalendarCheck, FaMoneyBillWave } from 'react-icons/fa';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import AssignmentComponent from '../Assign/AssignmentComponent';

function Dashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalDrivers: 0,
    totalVehicles: 0,
    recentBookings: [],
    availableVehicles: 0,
    availableDrivers: 0,
    vehicles: [],
    drivers: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'booking', 'driver', or 'vehicle'

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch bookings
      const bookingsResponse = await fetch('http://localhost:5000/defaultPackage/allPackages');
      if (!bookingsResponse.ok) {
        throw new Error(`Failed to fetch bookings data: ${bookingsResponse.status}`);
      }
      const bookingsResult = await bookingsResponse.json();
      const bookingsData = bookingsResult.data || [];

      // Fetch drivers
      const driversResponse = await fetch('http://localhost:5000/driver/all');
      if (!driversResponse.ok) {
        throw new Error(`Failed to fetch drivers data: ${driversResponse.status}`);
      }
      const driversResult = await driversResponse.json();
      const driversData = driversResult.data || [];

      // Fetch vehicles
      const vehiclesResponse = await fetch('http://localhost:5000/vehicle/all');
      if (!vehiclesResponse.ok) {
        throw new Error(`Failed to fetch vehicles data: ${vehiclesResponse.status}`);
      }
      const vehiclesResult = await vehiclesResponse.json();
      const vehiclesData = vehiclesResult.data || [];

      const availableVehicles = vehiclesData.filter(v => v.status === 'Available').length;
      const availableDrivers = driversData.filter(d => d.status === 'Available').length;

      setStats({
        totalBookings: bookingsData.length,
        totalDrivers: driversData.length,
        totalVehicles: vehiclesData.length,
        recentBookings: bookingsData.slice(-5).reverse(), // Get last 5 bookings
        availableVehicles,
        availableDrivers,
        vehicles: vehiclesData,
        drivers: driversData
      });
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setError(`Error: ${error.message}. Please check if the backend server is running on port 5000.`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (item, type) => {
    if (type === 'booking') {
      setSelectedBooking(item);
    } else if (type === 'driver') {
      setSelectedDriver(item);
    } else if (type === 'vehicle') {
      setSelectedVehicle(item);
    }
    setModalType(type);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedBooking(null);
    setSelectedDriver(null);
    setSelectedVehicle(null);
    setModalType('');
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaCalendarCheck />
          </div>
          <div className="stat-info">
            <h3>Total Bookings</h3>
            <p>{stats.totalBookings}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaUser />
          </div>
          <div className="stat-info">
            <h3>Total Drivers</h3>
            <p>{stats.totalDrivers}</p>
            
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaCar />
          </div>
          <div className="stat-info">
            <h3>Total Vehicles</h3>
            <p>{stats.totalVehicles}</p>
           
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="recent-bookings">
        <h2>Recent Bookings</h2>
        <div className="bookings-table-container">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer Name</th>
                <th>Package Name</th>
                <th>Departure Date</th>
                <th>Vehicle</th>
                <th>Number of Travelers</th>
                <th>More Details</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentBookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking._id?.slice(-6) || 'N/A'}</td>
                  <td>{booking.fullName || 'N/A'}</td>
                  <td>{booking.packageName || 'N/A'}</td>
                  <td>{booking.departureDate ? new Date(booking.departureDate).toISOString().split('T')[0] : 'N/A'}</td>
                  <td>{booking.vehicle || 'N/A'}</td>
                  <td>{booking.numberOfTravelers || 'N/A'}</td>
                  <td>
                    <button 
                      className="view-details-btn"
                      onClick={() => handleViewDetails(booking, 'booking')}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="section-header">
          <h2>Vehicle Details</h2>
          <button 
            className="add-vehicle-btn"
            onClick={() => window.location.href = '/vehicle/add'}
          >
            Register a New Vehicle
          </button>
        </div>
        <div className="vehicle-table-container">
          <table className="vehicle-table">
            <thead>
              <tr>
                <th>Vehicle Number</th>
                <th>Type</th>
                <th>Model</th>
                <th>Capacity</th>
                <th>More Details</th>
              </tr>
            </thead>
            <tbody>
              {stats.vehicles?.map((vehicle) => (
                <tr key={vehicle._id}>
                  <td>{vehicle.vehicleNumber}</td>
                  <td>{vehicle.vehicleType}</td>
                  <td>{vehicle.vehicleModel}</td>
                  <td>{vehicle.seatingCapacity}</td>
                  <td>
                    <button
                      className="view-details-btn"
                      onClick={() => handleViewDetails(vehicle, 'vehicle')}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Driver Details */}
      <div className="quick-actions">
        <div className="section-header">
          <h2>Driver Details</h2>
          <button 
            className="add-driver-btn"
            onClick={() => window.location.href = '/driver'}
          >
            Register a New Driver
          </button>
        </div>
        <div className="driver-table-container">
          <table className="driver-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>License Number</th>
                <th>Languages</th>
                <th>More Details</th>
              </tr>
            </thead>
            <tbody>
              {stats.drivers?.map((driver) => (
                <tr key={driver._id}>
                  <td>{driver.name}</td>
                  <td>{driver.phone}</td>
                  <td>{driver.driversLicenseNumber}</td>
                  <td>{driver.languages}</td>
                  <td>
                    <button
                      className="view-details-btn"
                      onClick={() => handleViewDetails(driver, 'driver')}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      <Dialog 
        open={openModal} 
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {modalType === 'booking' ? 'Booking Details' : 
           modalType === 'driver' ? 'Driver Details' : 
           'Vehicle Details'}
        </DialogTitle>
        <DialogContent>
          {modalType === 'booking' && selectedBooking && (
            <div className="booking-details">
              <div className="detail-row">
                <label>Full Name:</label>
                <span>{selectedBooking.fullName || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Email:</label>
                <span>{selectedBooking.email || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Contact Number:</label>
                <span>{selectedBooking.contactNumber || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Package Name:</label>
                <span>{selectedBooking.packageName || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Number of Travelers:</label>
                <span>{selectedBooking.numberOfTravelers || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Departure Date:</label>
                <span>{selectedBooking.departureDate || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Return Date:</label>
                <span>{selectedBooking.returnDate || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Preferred Time:</label>
                <span>{selectedBooking.preferredTime || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Vehicle:</label>
                <span>{selectedBooking.vehicle || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Vehicle Type:</label>
                <span>{selectedBooking.vehicleType || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Pickup Location:</label>
                <span>{selectedBooking.pickupLocation || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Drop Off Location:</label>
                <span>{selectedBooking.dropOffLocation || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Luggage Details:</label>
                <span>{selectedBooking.luggageDetails || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Child Seat:</label>
                <span>{selectedBooking.childSeat || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Driver Language:</label>
                <span>{selectedBooking.driverLanguage || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Special Request:</label>
                <span>{selectedBooking.specialRequest || 'N/A'}</span>
              </div>
            </div>
          )}

          {modalType === 'driver' && selectedDriver && (
            <div className="driver-details">
              <div className="detail-row">
                <label>Full Name:</label>
                <span>{selectedDriver.name || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Phone:</label>
                <span>{selectedDriver.phone || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Email:</label>
                <span>{selectedDriver.email || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>NIC:</label>
                <span>{selectedDriver.nic || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Gender:</label>
                <span>{selectedDriver.gender || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Date of Birth:</label>
                <span>{selectedDriver.dateOfBirth || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Languages:</label>
                <span>{selectedDriver.languages || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>License Number:</label>
                <span>{selectedDriver.driversLicenseNumber || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>License Expiry Date:</label>
                <span>{selectedDriver.licenseExpiryDate || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>License Category:</label>
                <span>{selectedDriver.licenseCategory || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Status:</label>
                <span>{selectedDriver.status || 'N/A'}</span>
              </div>
            </div>
          )}

          {modalType === 'vehicle' && selectedVehicle && (
            <div className="vehicle-details">
              <div className="detail-row">
                <label>Vehicle Number:</label>
                <span>{selectedVehicle.vehicleNumber || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Vehicle Type:</label>
                <span>{selectedVehicle.vehicleType || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Vehicle Model:</label>
                <span>{selectedVehicle.vehicleModel || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Owner Name:</label>
                <span>{selectedVehicle.ownerName || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Owner Contact Number:</label>
                <span>{selectedVehicle.ownerContactNumber || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Year of Manufacture:</label>
                <span>{selectedVehicle.yearOfManufacture || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Fuel Type:</label>
                <span>{selectedVehicle.fuelType || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>License Expiry Date:</label>
                <span>{selectedVehicle.licenseExpiryDate || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Color:</label>
                <span>{selectedVehicle.color || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Seating Capacity:</label>
                <span>{selectedVehicle.seatingCapacity || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Vehicle Features:</label>
                <span>{selectedVehicle.vehicleFeatures?.join(', ') || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Status:</label>
                <span className={`status-badge ${selectedVehicle.status?.toLowerCase().replace(' ', '-')}`}>
                  {selectedVehicle.status === 'Available' ? 'Available' : 
                   selectedVehicle.status === 'Not Available' ? 'Not Available' : 
                   selectedVehicle.status === 'Under Maintenance' ? 'Under Maintenance' : 
                   selectedVehicle.status}
                </span>
              </div>
              {selectedVehicle.vehicleImage && (
                <div className="detail-row">
                  <label>Vehicle Image:</label>
                  <div className="vehicle-image-container">
                    <img 
                      src={`http://localhost:5000${selectedVehicle.vehicleImage}`} 
                      alt="Vehicle" 
                      className="vehicle-image"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <AssignmentComponent></AssignmentComponent>
    </div>
  );
}

export default Dashboard; 