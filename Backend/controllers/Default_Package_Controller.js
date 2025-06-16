const express = require("express");
const router = express.Router();
const DefaultPackage = require("../Models/Default_Package_Model"); 

// Get All Default Packages
const getAllDefaultPackage = async (req, res) => {
    try {
        const defaultPackages = await DefaultPackage.find();
        if (!defaultPackages || defaultPackages.length === 0) {
            return res.status(404).json({ message: "No Default Packages found" });
        }
        return res.status(200).json({ 
            message: "Default Packages fetched successfully!",
            data: defaultPackages,
         });
    } catch (err) {
        console.error("Error fetching packages:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Add Default Package
const addDefaultPackage = async (req, res) => {
    const { fullName, email, contactNumber, numberOfTravelers, packageName , departureDate, returnDate, preferredTime , vehicle, vehicleType, pickupLocation, dropOffLocation,  luggageDetails, childSeat,driverLanguage,specialRequest } = req.body;

    try {
        const defaultPackage = new DefaultPackage({
            fullName,
            email,
            contactNumber,
            numberOfTravelers,
            packageName,
            departureDate,
            returnDate,
            preferredTime,
            vehicle, 
            vehicleType,
            pickupLocation,
            dropOffLocation,
            luggageDetails,
            childSeat,
            driverLanguage,
            specialRequest
        });

        await defaultPackage.save();
        return res.status(201).json({ 
            message: "Package added successfully!",
            data: defaultPackage,
         }); // Use 201 for created resource
    } catch (err) {
        console.error("Error adding package:", err);
        return res.status(500).json({ message: "Unable to add package" });
    }
};

// Get Default Package by ID
const getById = async (req, res) => {
    const { id } = req.params;
    
    try {
        const defaultPackage = await DefaultPackage.findById(id);
        if (!defaultPackage) {
            return res.status(404).json({ message: "Package not found" });
        }
        return res.status(200).json({
            message: `Package data for ${id} fetched successfully!`, 
            data: defaultPackage });
    } catch (err) {
        console.error("Error fetching package:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Update Default Package
const updateDefaultPackage = async (req, res) => {
    const { id } = req.params;
    const { fullName, email, contactNumber, numberOfTravelers, packageName , departureDate, returnDate, preferredTime , vehicle, vehicleType, pickupLocation, dropOffLocation,  luggageDetails, childSeat,driverLanguage,specialRequest } = req.body;

    try {
        const defaultPackage = await DefaultPackage.findByIdAndUpdate(
            id,
            {
                fullName,
                email,
                contactNumber,
                numberOfTravelers,
                packageName,
                departureDate,
                returnDate,
                preferredTime,
                vehicle, 
                vehicleType,
                pickupLocation,
                dropOffLocation,
                luggageDetails,
                childSeat,
                driverLanguage,
                specialRequest
            },
            { new: true } // Returns the updated document
        );

        if (!defaultPackage) {
            return res.status(404).json({ message: "Unable to update package" });
        }

        return res.status(200).json({ 
            mesage: "Package updated successfully!",
            data: defaultPackage,
     });
    } catch (err) {
        console.error("Error updating package:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

//Delete Default Package Booking Details
// Delete Default Package
const deleteDefaultPackage = async (req, res, next) => {
    const id = req.params.id;

    let defaultPackage;
    try {
        defaultPackage = await DefaultPackage.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
    }

    if (!defaultPackage) {
        return res.status(404).json({ message: "Unable to delete. Default Package not found" });
    }

    return res.status(200).json({ message: "Default Package deleted successfully!" });
};

exports.deleteDefaultPackage = deleteDefaultPackage;


// Export Controllers
exports.getAllDefaultPackage = getAllDefaultPackage;
exports.addDefaultPackage = addDefaultPackage;
exports.getById = getById;
exports.updateDefaultPackage = updateDefaultPackage;
exports.deleteDefaultPackage = deleteDefaultPackage;
