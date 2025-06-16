const Driver = require('../Models/DriverModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/drivers');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Filter for only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Set up multer upload
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).fields([
  { name: 'driverPicture', maxCount: 1 },
  { name: 'licenseCopy', maxCount: 1 }
]);

// controllers/DriverController.js
const createDriver = async (req, res) => {
  // Use multer to handle the file uploads
  upload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      return res.status(400).json({
        success: false,
        message: "Upload error",
        error: err.message
      });
    } else if (err) {
      // An unknown error occurred
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: err.message
      });
    }
    
    // Check if files were uploaded
    if (!req.files || !req.files['driverPicture'] || !req.files['licenseCopy']) {
      return res.status(400).json({
        success: false,
        message: "Missing required files",
        error: "Both driver picture and license copy are required"
      });
    }

    try {
      // Get the file paths
      const driverPicturePath = req.files['driverPicture'][0].path;
      const licenseCopyPath = req.files['licenseCopy'][0].path;
      
      // Process languages and license categories
      let languages = [];
      let licenseCategory = [];
      
      if (req.body.languages) {
        languages = req.body.languages.split(',').map(lang => lang.trim());
      }
      
      if (req.body.licenseCategory) {
        licenseCategory = req.body.licenseCategory.split(',').map(cat => cat.trim());
      }

      // Create driver data object
      const driverData = {
        name: req.body.name,
        phone: req.body.phone,
        nic: req.body.nic,
        email: req.body.email,
        gender: req.body.gender,
        dateOfBirth: new Date(req.body.dateOfBirth),
        languages: req.body.languages,
        driversLicenseNumber: req.body.driversLicenseNumber,
        licenseExpiryDate: new Date(req.body.licenseExpiryDate),
        licenseCategory: req.body.licenseCategory,
        driverPicture: driverPicturePath.replace(/\\/g, '/'),  // Normalize path for different OS
        licenseCopy: licenseCopyPath.replace(/\\/g, '/'),      // Normalize path for different OS
        isAvailable: true
      };

      const newDriver = new Driver(driverData);
      const savedDriver = await newDriver.save();

      res.status(201).json({
        success: true,
        message: "Driver created successfully",
        data: savedDriver
      });
    } catch (error) {
      console.error('Error creating driver:', error);
      res.status(400).json({
        success: false,
        message: "Error creating driver",
        error: error.message
      });
    }
  });
};

// Get all drivers
const getAllDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find();
        res.status(200).json({
            success: true,
            message: "Drivers retrieved successfully",
            data: drivers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error retrieving drivers",
            error: error.message
        });
    }
};

// Get driver by ID
const getDriverById = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Driver retrieved successfully",
            data: driver
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error retrieving driver",
            error: error.message
        });
    }
};

// Update driver
const updateDriver = async (req, res) => {
    try {
        const updatedDriver = await Driver.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedDriver) {
            return res.status(404).json({
                success: false,
                message: "Driver not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Driver updated successfully",
            data: updatedDriver
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error updating driver",
            error: error.message
        });
    }
};

// Delete driver
const deleteDriver = async (req, res) => {
    try {
        const deletedDriver = await Driver.findByIdAndDelete(req.params.id);
        if (!deletedDriver) {
            return res.status(404).json({
                success: false,
                message: "Driver not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Driver deleted successfully",
            data: deletedDriver
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting driver",
            error: error.message
        });
    }
};

// Get available drivers
const getAvailableDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find({ isAvailable: true });
        res.status(200).json({
            success: true,
            message: "Available drivers retrieved successfully",
            data: drivers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error retrieving available drivers",
            error: error.message
        });
    }
};

// Get drivers by license category
const getDriversByLicenseCategory = async (req, res) => {
    try {
        const drivers = await Driver.find({ 
            licenseCategory: { $regex: req.params.category, $options: 'i' } 
        });
        res.status(200).json({
            success: true,
            message: "Drivers retrieved successfully",
            data: drivers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error retrieving drivers by license category",
            error: error.message
        });
    }
};

// Get drivers by language
const getDriversByLanguage = async (req, res) => {
    try {
        const drivers = await Driver.find({ 
            languages: { $regex: req.params.language, $options: 'i' } 
        });
        res.status(200).json({
            success: true,
            message: "Drivers retrieved successfully",
            data: drivers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error retrieving drivers by language",
            error: error.message
        });
    }
};

module.exports = {
    createDriver,
    getAllDrivers,
    getDriverById,
    updateDriver,
    deleteDriver,
    getAvailableDrivers,
    getDriversByLicenseCategory,
    getDriversByLanguage
};