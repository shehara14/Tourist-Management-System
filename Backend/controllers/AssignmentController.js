const Assignment = require('../Models/AssignmentModel');
const Driver = require('../Models/DriverModel');
const Vehicle = require('../Models/VehicleModel');

const createAssignment = async (req, res) => {
    try {
        // Check if driver and vehicle exist - using driverId and vehicleId to match frontend
        const driver = await Driver.findById(req.body.driver);
        const vehicle = await Vehicle.findById(req.body.vehicle);
        
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver not found",
                receivedId: req.body.driver
            });
        }

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
                receivedId: req.body.vehicle
            });
        }

        // Check availability
        if (!driver.isAvailable || !vehicle.isAvailable) {
            return res.status(400).json({
                success: false,
                message: "Driver or Vehicle not available",
                driverAvailable: driver.isAvailable,
                vehicleAvailable: vehicle.isAvailable
            });
        }

        // Create assignment
        const newAssignment = new Assignment({
            vehicle: req.body.vehicle,
            driver: req.body.driver,
            startDate: req.body.startDate || new Date(),
            notes: req.body.notes,
            isActive: true
        });

        const savedAssignment = await newAssignment.save();

        // Update statuses
        driver.isAvailable = true;
        vehicle.isAvailable = true;
        await driver.save();
        await vehicle.save();

        res.status(201).json({
            success: true,
            message: "Assignment created successfully",
            data: await savedAssignment.populate(['driver', 'vehicle'])
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error creating assignment",
            error: error.message
        });
    }
};

// Get all assignments
const getAllAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find()
            .populate('vehicle')
            .populate('driver');
            
        res.status(200).json({
            success: true,
            message: "Assignments retrieved successfully",
            data: assignments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error retrieving assignments",
            error: error.message
        });
    }
};

// Get active assignments
const getActiveAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({ isActive: true })
            .populate('vehicle')
            .populate('driver');
            
        res.status(200).json({
            success: true,
            message: "Active assignments retrieved successfully",
            data: assignments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error retrieving active assignments",
            error: error.message
        });
    }
};

// End assignment
const endAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found"
            });
        }

        if (!assignment.isActive) {
            return res.status(400).json({
                success: false,
                message: "Assignment is already ended"
            });
        }

        // Update assignment
        assignment.isActive = false;
        assignment.endDate = Date.now();
        const updatedAssignment = await assignment.save();

        // Update driver and vehicle status
        const driver = await Driver.findById(assignment.driver);
        const vehicle = await Vehicle.findById(assignment.vehicle);
        
        if (driver) {
            driver.isAvailable = true;
            await driver.save();
        }
        
        if (vehicle) {
            vehicle.isAvailable = true;
            await vehicle.save();
        }

        res.status(200).json({
            success: true,
            message: "Assignment ended successfully",
            data: updatedAssignment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error ending assignment",
            error: error.message
        });
    }
};

// Get assignments by driver
const getAssignmentsByDriver = async (req, res) => {
    try {
        const assignments = await Assignment.find({ driver: req.params.driverId })
            .populate('vehicle')
            .sort({ startDate: -1 });
            
        res.status(200).json({
            success: true,
            message: "Driver assignments retrieved successfully",
            data: assignments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error retrieving driver assignments",
            error: error.message
        });
    }
};

// Get assignments by vehicle
const getAssignmentsByVehicle = async (req, res) => {
    try {
        const assignments = await Assignment.find({ vehicle: req.params.vehicleId })
            .populate('driver')
            .sort({ startDate: -1 });
            
        res.status(200).json({
            success: true,
            message: "Vehicle assignments retrieved successfully",
            data: assignments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error retrieving vehicle assignments",
            error: error.message
        });
    }
};

module.exports = {
    createAssignment,
    getAllAssignments,
    getActiveAssignments,
    endAssignment,
    getAssignmentsByDriver,
    getAssignmentsByVehicle
};