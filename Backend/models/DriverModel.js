const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  nic: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  gender: {
    type: String, 
    enum: ['Male', 'Female', 'Other'],  
    required: true
  },
  dateOfBirth: {
    type: Date, 
    required: true
  },
  languages: {
    type: String, 
    required: true
  },
  driversLicenseNumber: {
    type: String,
    required: true
  },
  licenseExpiryDate: {
    type: Date,
    required: true
  },
  licenseCategory: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  driverPicture: {
    type: String,  // Path to image file
    required: true
  },
  licenseCopy: {
    type: String,  // Path to image file
    required: true
  }
}, {
  timestamps: true  // Add createdAt and updatedAt fields
});

module.exports = mongoose.model('Driver', driverSchema);