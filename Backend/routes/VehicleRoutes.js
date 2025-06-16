const express = require('express');
const router = express.Router();
const vehicleController = require('../Controllers/VehicleController');
const multer = require('multer');
const path = require('path');
const Vehicle = require('../Models/VehicleModel');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/vehicles')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

// Routes
router.post('/create', upload.single('vehicleImage'), vehicleController.createVehicle);           // Create new vehicle
router.get('/all', vehicleController.getAllVehicles);              // Get all vehicles
router.get('/vehicle/:id', vehicleController.getVehicleById);      // Get vehicle by ID
router.put('/edit/:id', vehicleController.updateVehicle);          // Update vehicle
router.delete('/delete/:id', vehicleController.deleteVehicle);     // Delete vehicle
// Get available vehicles
router.get('/available', async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ isAvailable: true });
    res.status(200).json({
      success: true,
      message: "Available vehicles retrieved successfully",
      data: vehicles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving available vehicles",
      error: error.message
    });
  }
});

module.exports = router;
