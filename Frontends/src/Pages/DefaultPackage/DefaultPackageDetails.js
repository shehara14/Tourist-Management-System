import React, { useState, useEffect, useRef } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import Swal from 'sweetalert2';
import { useNavigate, useLocation } from 'react-router-dom';
import './DefaultPackageDetails.css';
import { useReactToPrint } from 'react-to-print';
import letterheadImg from '../../Images/letterhead.png';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function DefaultPackageDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const [packages, setPackages] = useState({ data: [] });
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [open, setOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportPackage, setReportPackage] = useState(null);
  const [errors, setErrors] = useState({});
  const reportRef = useRef();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    packageName: '',
    numberOfTravelers: '',
    departureDate: '',
    returnDate: '',
    preferredTime: '',
    vehicle: '',
    vehicleType: '',
    pickupLocation: '',
    dropOffLocation: '',
    luggageDetails: '',
    childSeat: '',
    driverLanguage: '',
    specialRequest: '',
  });

const handlePrint = () => {
  if (!reportRef.current) return;
  
  Swal.fire({
    title: 'Generating PDF',
    text: 'Please wait...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
      
      const reportElement = reportRef.current;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // A4 dimensions in mm
      const a4Width = 210;
      const a4Height = 297;
      
      // Quality scale factor
      const scale = 2;

      html2canvas(reportElement, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        
        // Calculate aspect ratios
        const imgRatio = canvas.width / canvas.height;
        const pdfRatio = a4Width / a4Height;
        
        let finalWidth, finalHeight, xOffset, yOffset;
        
        if (imgRatio > pdfRatio) {
          // Image is wider than PDF - fit to width
          finalWidth = a4Width;
          finalHeight = finalWidth / imgRatio;
          xOffset = 0;
          yOffset = (a4Height - finalHeight) / 2;
        } else {
          // Image is taller than PDF - fit to height
          finalHeight = a4Height;
          finalWidth = finalHeight * imgRatio;
          xOffset = (a4Width - finalWidth) / 2;
          yOffset = 0;
        }

        // Add white background first
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, a4Width, a4Height, 'F');
        
        // Add the centered image
        pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
        
        pdf.save(`Travel_Package_Report_${reportPackage?.fullName || 'Customer'}.pdf`);
        
        Swal.close();
        Swal.fire({
          icon: 'success',
          title: 'PDF Downloaded Successfully',
          showConfirmButton: false,
          timer: 1500
        });
      }).catch(error => {
        console.error('PDF generation error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to generate PDF. Please try again.'
        });
      });
    }
  });
};

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateContactNumber = (number) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(number);
  };

  const validateDates = (departure, returnDate) => {
    if (!departure || !returnDate) return true;
    return new Date(returnDate) >= new Date(departure);
  };

  const validateNumberOfTravelers = (number) => {
    return number > 0 && Number.isInteger(Number(number));
  };

  // Handle generate report
  const handleGenerateReport = (pkg) => {
    setReportPackage(pkg);
    setReportOpen(true);
  };

  // Fetch user's packages from the database
  useEffect(() => {
    const fetchUserPackages = async () => {
      try {
        // If we have a new booking from the form submission
        if (location.state?.isNewBooking) {
          setPackages({ data: [location.state.currentBooking] });
          return;
        }

        // Otherwise, fetch user's packages based on email
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
          const response = await fetch(`http://localhost:5000/defaultPackage/userPackages/${userEmail}`);
          if (response.ok) {
            const data = await response.json();
            setPackages({ data: data.data || [] });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to fetch your packages.',
            });
          }
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch packages. Please try again later.',
        });
      }
    };

    fetchUserPackages();
  }, [location.state]);

  // Fetch a package by ID
  const fetchPackageById = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/defaultPackage/package/${id}`);
      if (response.ok) {
        const data = await response.json();

        // Ensure that data is in the correct format before setting it
        const packageDetails = data.data || data;

        setSelectedPackage(packageDetails);
        setFormData({
          fullName: packageDetails.fullName || '',
          email: packageDetails.email || '',
          contactNumber: packageDetails.contactNumber || '',
          packageName: packageDetails.packageName || '',
          numberOfTravelers: packageDetails.numberOfTravelers || '',
          departureDate: packageDetails.departureDate || '',
          returnDate: packageDetails.returnDate || '',
          preferredTime: packageDetails.preferredTime || '',
          vehicle: packageDetails.vehicle || '',
          vehicleType: packageDetails.vehicleType || '',
          pickupLocation: packageDetails.pickupLocation || '',
          dropOffLocation: packageDetails.dropOffLocation || '',
          luggageDetails: packageDetails.luggageDetails || '',
          childSeat: packageDetails.childSeat || '',
          driverLanguage: packageDetails.driverLanguage || '',
          specialRequest: packageDetails.specialRequest || '',
        });

        setOpen(true);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch package details.',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch package details. Please try again later.',
      });
    }
  };

  // Handle input changes with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Real-time validation
    const newErrors = { ...errors };
    
    switch (name) {
      case 'email':
        if (!validateEmail(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      case 'contactNumber':
        if (!validateContactNumber(value)) {
          newErrors.contactNumber = 'Please enter a valid 10-digit contact number';
        } else {
          delete newErrors.contactNumber;
        }
        break;
      case 'numberOfTravelers':
        if (!validateNumberOfTravelers(value)) {
          newErrors.numberOfTravelers = 'Please enter a valid number of travelers';
        } else {
          delete newErrors.numberOfTravelers;
        }
        break;
      case 'departureDate':
      case 'returnDate':
        if (!validateDates(formData.departureDate, formData.returnDate)) {
          newErrors.returnDate = 'Return date must be after departure date';
        } else {
          delete newErrors.returnDate;
        }
        break;
      default:
        if (!value.trim()) {
          newErrors[name] = 'This field is required';
        } else {
          delete newErrors[name];
        }
    }

    setErrors(newErrors);
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    Object.keys(formData).forEach(key => {
      const value = formData[key];
      if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
        newErrors[key] = 'This field is required';
      }
    });

    // Email validation
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Number of travelers validation
    if (formData.numberOfTravelers && !validateNumberOfTravelers(formData.numberOfTravelers)) {
      newErrors.numberOfTravelers = 'Please enter a valid number of travelers';
    }

    // Date validation
    if (formData.departureDate && formData.returnDate && !validateDates(formData.departureDate, formData.returnDate)) {
      newErrors.returnDate = 'Return date must be after departure date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Modify handleUpdateSubmit to include user email
  const handleUpdateSubmit = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const updatedData = { ...formData, userEmail };

      const response = await fetch(`http://localhost:5000/defaultPackage/editPackage/${selectedPackage._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          position: 'top',
          icon: 'success',
          title: 'Package updated successfully!',
          showConfirmButton: false,
          timer: 2000,
        });

        setPackages(prevPackages => ({
          data: prevPackages.data.map((pkg) =>
            pkg._id === selectedPackage._id ? { ...pkg, ...updatedData } : pkg
          )
        }));

        setOpen(false);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: result.message || 'Something went wrong!',
        });
      }
    } catch (error) {
      console.error("Update Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update package. Please try again later.',
      });
    }
  };

  // Modify handleDelete to include user verification
  const handleDelete = async (id) => {
    const userEmail = localStorage.getItem('userEmail');
    const packageToDelete = packages.data.find(pkg => pkg._id === id);

    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete this package?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://localhost:5000/defaultPackage/deletePackage/${id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Details Deleted Successfully!',
              showConfirmButton: false,
              timer: 2000,
            });

            setPackages(prevPackages => ({
              data: prevPackages.data.filter((pkg) => pkg._id !== id)
            }));
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Delete Failed',
              text: 'Failed to delete the package. Please try again later.',
            });
          }
        } catch (error) {
          console.error("Delete Error:", error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to delete the package. Please try again later.',
          });
        }
      }
    });
  };

  // Close the dialog
  const handleClose = () => {
    setOpen(false);
    setSelectedPackage(null);
    setFormData({
      fullName: '',
      email: '',
      contactNumber: '',
      packageName: '',
      numberOfTravelers: '',
      departureDate: '',
      returnDate: '',
      preferredTime: '',
      vehicle: '',
      vehicleType: '',
      pickupLocation: '',
      dropOffLocation: '',
      luggageDetails: '',
      childSeat: '',
      driverLanguage: '',
      specialRequest: '',
    });
  };

  // Close report dialog
  const handleReportClose = () => {
    setReportOpen(false);
    setReportPackage(null);
  };

  // Format date for better display in the report
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Generate a reference number based on package details
  const generateRefNumber = (pkg) => {
    if (!pkg) return '';
    const namePart = pkg.fullName.substring(0, 3).toUpperCase();
    const datePart = new Date().getTime().toString().substring(5, 13);
    return `TR-${namePart}${datePart}`;
  };

  return (
    <div className="package-details-container">
      <h1>Submitted Package Details</h1>
      {packages.data?.length > 0 ? (
        packages.data.map((pkg) => (
          <div key={pkg._id} className="package-card">
            <div className="package-details">
              <p><strong>Full Name:</strong> {pkg.fullName}</p>
              <p><strong>Email:</strong> {pkg.email}</p>
              <p><strong>Contact Number:</strong> {pkg.contactNumber}</p>
              <p><strong>Package Name:</strong> {pkg.packageName}</p>
              <p><strong>Number of Travelers:</strong> {pkg.numberOfTravelers}</p>
              <p><strong>Departure Date:</strong> {pkg.departureDate}</p>
              <p><strong>Return Date:</strong> {pkg.returnDate}</p>
              <p><strong>Preferred Time:</strong> {pkg.preferredTime}</p>
              <p><strong>Vehicle:</strong> {pkg.vehicle}</p>
              <p><strong>Vehicle Type:</strong> {pkg.vehicleType}</p>
              <p><strong>Pickup Location:</strong> {pkg.pickupLocation}</p>
              <p><strong>Drop Off Location:</strong> {pkg.dropOffLocation}</p>
              <p><strong>Luggage Details:</strong> {pkg.luggageDetails}</p>
              <p><strong>Child Seat:</strong> {pkg.childSeat}</p>
              <p><strong>Driver Language:</strong> {pkg.driverLanguage || 'No languages selected'}</p>
              <p><strong>Special Request:</strong> {pkg.specialRequest}</p>
            </div>
            <div className="package-actions">
              <Button
                variant="contained"
                style={{ backgroundColor: 'blue', color: 'white', marginRight: '10px' }}
                onClick={() => fetchPackageById(pkg._id)}
              >
                Update
              </Button>
              <Button
                variant="contained"
                style={{ backgroundColor: 'red', color: 'white', marginRight: '10px' }}
                onClick={() => handleDelete(pkg._id)}
              >
                Delete
              </Button>
              <Button
                variant="contained"
                style={{ backgroundColor: 'green', color: 'white' }}
                onClick={() => handleGenerateReport(pkg)}
              >
                Generate Report
              </Button>
              <Button
                variant="contained"
                style={{ backgroundColor: '#f57c00', color: 'white' }}
                onClick={() => navigate('/payment')}
              >
                Proceed to Payment
              </Button>
            </div>
          </div>
        ))
      ) : (
        <div className="no-bookings">
          <h3>No Bookings Found</h3>
          <p>You haven't made any bookings yet. Click below to book your tour package.</p>
          <Button
            variant="contained"
            style={{ backgroundColor: '#1976d2', color: 'white', marginTop: '15px' }}
            onClick={() => navigate('/defaultpackage')}
          >
            Book Now
          </Button>
        </div>
      )}

      {/* Update Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Package Details</DialogTitle>
        <DialogContent>
          <div className="form-grid">
            <TextField
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              fullWidth
              error={!!errors.fullName}
              helperText={errors.fullName}
              margin="normal"
            />
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              error={!!errors.email}
              helperText={errors.email}
              margin="normal"
            />
            <TextField
              label="Contact Number"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
              fullWidth
              error={!!errors.contactNumber}
              helperText={errors.contactNumber}
              margin="normal"
            />
            <TextField
              label="Package Name"
              name="packageName"
              value={formData.packageName}
              onChange={handleInputChange}
              fullWidth
              error={!!errors.packageName}
              helperText={errors.packageName}
              margin="normal"
            />
            <TextField
              label="Number of Travelers"
              name="numberOfTravelers"
              type="number"
              value={formData.numberOfTravelers}
              onChange={handleInputChange}
              fullWidth
              error={!!errors.numberOfTravelers}
              helperText={errors.numberOfTravelers}
              margin="normal"
            />
            <TextField
              label="Departure Date"
              name="departureDate"
              type="date"
              value={formData.departureDate}
              onChange={handleInputChange}
              fullWidth
              error={!!errors.departureDate}
              helperText={errors.departureDate}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Return Date"
              name="returnDate"
              type="date"
              value={formData.returnDate}
              onChange={handleInputChange}
              fullWidth
              error={!!errors.returnDate}
              helperText={errors.returnDate}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Preferred Time"
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleInputChange}
              fullWidth
              error={!!errors.preferredTime}
              helperText={errors.preferredTime}
              margin="normal"
            />
            <TextField
              label="Vehicle"
              name="vehicle"
              value={formData.vehicle}
              onChange={handleInputChange}
              fullWidth
              error={!!errors.vehicle}
              helperText={errors.vehicle}
              margin="normal"
            />
            <TextField
              label="Vehicle Type"
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleInputChange}
              fullWidth
              error={!!errors.vehicleType}
              helperText={errors.vehicleType}
              margin="normal"
            />
            <TextField
              label="Pickup Location"
              name="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleInputChange}
              fullWidth
              error={!!errors.pickupLocation}
              helperText={errors.pickupLocation}
              margin="normal"
            />
            <TextField
              label="Drop Off Location"
              name="dropOffLocation"
              value={formData.dropOffLocation}
              onChange={handleInputChange}
              fullWidth
              error={!!errors.dropOffLocation}
              helperText={errors.dropOffLocation}
              margin="normal"
            />
            <TextField
              label="Luggage Details"
              name="luggageDetails"
              value={formData.luggageDetails}
              onChange={handleInputChange}
              fullWidth
              error={!!errors.luggageDetails}
              helperText={errors.luggageDetails}
              margin="normal"
            />
            <TextField
              label="Child Seat"
              name="childSeat"
              value={formData.childSeat}
              onChange={handleInputChange}
              fullWidth
              error={!!errors.childSeat}
              helperText={errors.childSeat}
              margin="normal"
            />
            <TextField
              label="Driver Language"
              name="driverLanguage"
              value={formData.driverLanguage}
              onChange={handleInputChange}
              fullWidth
              error={!!errors.driverLanguage}
              helperText={errors.driverLanguage}
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Special Request"
              name="specialRequest"
              value={formData.specialRequest}
              onChange={handleInputChange}
              fullWidth
              error={!!errors.specialRequest}
              helperText={errors.specialRequest}
              margin="normal"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleUpdateSubmit} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Dialog */}
      <Dialog 
        open={reportOpen} 
        onClose={handleReportClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          style: {
            maxHeight: '90vh',
            overflow: 'auto'
          }
        }}
      >
        <DialogTitle>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Travel Package Report</span>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handlePrint}
            >
              Download PDF
            </Button>
          </div>
        </DialogTitle>
        <DialogContent>
          <div style={{ padding: '20px' }}>
            <div ref={reportRef} className="report-container" style={{ 
              padding: '20px',
              backgroundColor: 'white',
              width: '100%'
            }}>
              <div className="report-header">
                <img src={letterheadImg} alt="Company Letterhead" style={{ width: '100%', maxHeight: '150px', objectFit: 'contain' }} />
              </div>
              
              <div className="report-title" style={{ textAlign: 'center', margin: '20px 0' }}>
                <h1 style={{ color: '#1976d2', marginBottom: '5px' }}>Travel Package Confirmation</h1>
                <p style={{ fontSize: '16px', color: '#555' }}>Reference #: {generateRefNumber(reportPackage)}</p>
                <p style={{ fontSize: '16px', color: '#555' }}>
                  Date: {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              
              <div className="customer-info" style={{ 
                backgroundColor: '#f9f9f9', 
                padding: '20px', 
                borderRadius: '8px',
                marginBottom: '20px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ color: '#1976d2', borderBottom: '2px solid #1976d2', paddingBottom: '8px', marginBottom: '15px' }}>
                  Customer Information
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <p><strong>Name:</strong> {reportPackage?.fullName}</p>
                    <p><strong>Email:</strong> {reportPackage?.email}</p>
                    <p><strong>Contact Number:</strong> {reportPackage?.contactNumber}</p>
                  </div>
                  <div>
                    <p><strong>Package:</strong> {reportPackage?.packageName}</p>
                    <p><strong>Travelers:</strong> {reportPackage?.numberOfTravelers}</p>
                  </div>
                </div>
              </div>
              
              <div className="trip-details" style={{ 
                backgroundColor: '#f9f9f9', 
                padding: '20px', 
                borderRadius: '8px',
                marginBottom: '20px', 
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ color: '#1976d2', borderBottom: '2px solid #1976d2', paddingBottom: '8px', marginBottom: '15px' }}>
                  Trip Details
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <p><strong>Departure Date:</strong> {formatDate(reportPackage?.departureDate)}</p>
                    <p><strong>Return Date:</strong> {formatDate(reportPackage?.returnDate)}</p>
                    <p><strong>Preferred Time:</strong> {reportPackage?.preferredTime}</p>
                  </div>
                  <div>
                    <p><strong>Duration:</strong> {reportPackage?.departureDate && reportPackage?.returnDate ? 
                      Math.ceil((new Date(reportPackage.returnDate) - new Date(reportPackage.departureDate)) / (1000 * 60 * 60 * 24)) + ' days' : 
                      'N/A'}
                    </p>
                    <p><strong>Pickup:</strong> {reportPackage?.pickupLocation}</p>
                    <p><strong>Drop-off:</strong> {reportPackage?.dropOffLocation}</p>
                  </div>
                </div>
              </div>
              
              <div className="transportation-details" style={{ 
                backgroundColor: '#f9f9f9', 
                padding: '20px', 
                borderRadius: '8px',
                marginBottom: '20px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ color: '#1976d2', borderBottom: '2px solid #1976d2', paddingBottom: '8px', marginBottom: '15px' }}>
                  Transportation Details
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <p><strong>Vehicle:</strong> {reportPackage?.vehicle}</p>
                    <p><strong>Vehicle Type:</strong> {reportPackage?.vehicleType}</p>
                  </div>
                  <div>
                    <p><strong>Luggage:</strong> {reportPackage?.luggageDetails}</p>
                    <p><strong>Child Seat:</strong> {reportPackage?.childSeat}</p>
                  </div>
                </div>
              </div>
              
              <div className="additional-information" style={{ 
                backgroundColor: '#f9f9f9', 
                padding: '20px', 
                borderRadius: '8px',
                marginBottom: '20px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ color: '#1976d2', borderBottom: '2px solid #1976d2', paddingBottom: '8px', marginBottom: '15px' }}>
                  Additional Information
                </h2>
                <p><strong>Driver Language:</strong> {reportPackage?.driverLanguage || 'Not specified'}</p>
                <p><strong>Special Requests:</strong> {reportPackage?.specialRequest || 'None'}</p>
              </div>
              
              <div className="report-footer" style={{ marginTop: '30px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
                <h3 style={{ color: '#555' }}>Terms & Conditions</h3>
                <ul style={{ color: '#666', fontSize: '14px' }}>
                  <li>Please arrive at the pickup location at least 15 minutes before the scheduled departure time.</li>
                  <li>Cancellations must be made 48 hours in advance for a full refund.</li>
                  <li>Please carry a valid ID for all travelers.</li>
                  <li>The company is not responsible for any delays due to traffic or weather conditions.</li>
                </ul>
                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#888' }}>
                  <p>Thank you for choosing our services. We look forward to serving you!</p>
                  <p>For any queries, please contact us at support@traveltour.com or call +1-234-567-8900</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReportClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default DefaultPackageDetails;