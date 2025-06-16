const Vehicle = require('../Models/VehicleModel');
const multer = require('multer');
const path = require('path');

// Create a new vehicle
const createVehicle = async (req, res) => {
    try {
        // Create vehicle data object
        const vehicleData = {
            ...req.body,
            vehicleImage: req.file ? `/uploads/vehicles/${req.file.filename}` : null
        };

        const newVehicle = new Vehicle(vehicleData);
        const savedVehicle = await newVehicle.save();
        
        res.status(201).json({
            success: true,
            message: "Vehicle created successfully",
            data: savedVehicle
        });
    } catch (error) {
        console.error('Error creating vehicle:', error);
        res.status(400).json({
            success: false,
            message: "Error creating vehicle",
            error: error.message
        });
    }
};

// Get all vehicles
const getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find();
        res.status(200).json({
            success: true,
            message: "Vehicles retrieved successfully",
            data: vehicles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error retrieving vehicles",
            error: error.message
        });
    }
};

// Get vehicle by ID
const getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Vehicle retrieved successfully",
            data: vehicle
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error retrieving vehicle",
            error: error.message
        });
    }
};

// Update vehicle
const updateVehicle = async (req, res) => {
    try {
        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedVehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Vehicle updated successfully",
            data: updatedVehicle
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error updating vehicle",
            error: error.message
        });
    }
};

// Delete vehicle
const deleteVehicle = async (req, res) => {
    try {
        const deletedVehicle = await Vehicle.findByIdAndDelete(req.params.id);
        if (!deletedVehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Vehicle deleted successfully",
            data: deletedVehicle
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting vehicle",
            error: error.message
        });
    }
};

// Get available vehicles
const getAvailableVehicles = async (req, res) => {
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
};

// Get vehicles by type
const getVehiclesByType = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ vehicleType: req.params.type });
        res.status(200).json({
            success: true,
            message: "Vehicles retrieved successfully",
            data: vehicles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error retrieving vehicles by type",
            error: error.message
        });
    }
};

module.exports = {
    createVehicle,
    getAllVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle,
    getAvailableVehicles,
    getVehiclesByType
}; 