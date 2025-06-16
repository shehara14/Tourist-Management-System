const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: true,
    unique: true
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['car', 'mini-van', 'van', 'mini-bus', 'king-long-bus']
  },
  vehicleModel: {
    type: String,
    required: true // e.g., "Toyota Hiace"
  },
  ownerName: {
    type: String,
    required: true // e.g., "John Doe"
  },
  ownerContactNumber: {
    type: String,
    required: true // e.g., "9876543210"
  },
  yearOfManufacture: {
    type: Number,
    required: true // e.g., 2019
  },
  fuelType: {
    type: String,
    required: true,
    enum: ['Diesel', 'Petrol', 'Electric', 'Hybrid']
  },
  licenseExpiryDate: {
    type: Date,
    required: true
  },
  color: {
    type: String,
    required: true // e.g., "White"
  },
  seatingCapacity: {
    type: Number,
    required: true
  }, 
  vehicleFeatures: {
    type: [String], // Array of strings, e.g., ["AC", "WiFi", "Luggage Space"]
    default: []
  },
  vehicleImage: {
    type: String, // URL or path to the image
    required: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
