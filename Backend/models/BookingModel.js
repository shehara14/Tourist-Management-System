const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Optional: if you have user accounts
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package' // If packages are in DB
  },
  date: {
    type: Date,
    required: true
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  status: {
    type: String,
    default: 'Pending', // Pending, Confirmed, Completed, Cancelled
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled']
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
