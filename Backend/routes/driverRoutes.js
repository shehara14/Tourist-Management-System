const express = require("express");
const router = express.Router();

// Import Controller
const DriverController = require("../Controllers/DriverController");

// Routes - No multer middleware since it's now handled in the controller
router.post("/create", DriverController.createDriver);          // Create new driver
router.get("/all", DriverController.getAllDrivers);             // Get all drivers
router.get("/driver/:id", DriverController.getDriverById);      // Get driver by ID
router.put("/edit/:id", DriverController.updateDriver);         // Update driver
router.delete("/delete/:id", DriverController.deleteDriver);    // Delete driver
router.get('/available', DriverController.getAvailableDrivers); // Get available drivers
router.get('/category/:category', DriverController.getDriversByLicenseCategory); // Get by license category
router.get('/language/:language', DriverController.getDriversByLanguage);        // Get by language

// Export Router
module.exports = router;