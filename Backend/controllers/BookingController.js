const Booking = require("../Models/BookingModel");

// Get All Bookings
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('userId')
            .populate('packageId')
            .populate('vehicleId')
            .populate('driverId');
            
        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: "No bookings found" });
        }
        return res.status(200).json({ 
            message: "Bookings fetched successfully!",
            data: bookings,
         });
    } catch (err) {
        console.error("Error fetching bookings:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Add New Booking
const addBooking = async (req, res) => {
    const { userId, packageId, date, vehicleId, driverId, status } = req.body;

    try {
        const booking = new Booking({
            userId,
            packageId,
            date,
            vehicleId,
            driverId,
            status: status || 'Pending'
        });

        await booking.save();
        return res.status(201).json({ 
            message: "Booking added successfully!",
            data: booking,
         });
    } catch (err) {
        console.error("Error adding booking:", err);
        return res.status(500).json({ message: "Unable to add booking" });
    }
};

// Get Booking by ID
const getBookingById = async (req, res) => {
    const { id } = req.params;
    
    try {
        const booking = await Booking.findById(id)
            .populate('userId')
            .populate('packageId')
            .populate('vehicleId')
            .populate('driverId');
            
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        return res.status(200).json({
            message: `Booking data for ${id} fetched successfully!`, 
            data: booking 
        });
    } catch (err) {
        console.error("Error fetching booking:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Update Booking
const updateBooking = async (req, res) => {
    const { id } = req.params;
    const { userId, packageId, date, vehicleId, driverId, status } = req.body;

    try {
        const booking = await Booking.findByIdAndUpdate(
            id,
            {
                userId,
                packageId,
                date,
                vehicleId,
                driverId,
                status
            },
            { new: true }
        ).populate('userId')
         .populate('packageId')
         .populate('vehicleId')
         .populate('driverId');

        if (!booking) {
            return res.status(404).json({ message: "Unable to update booking" });
        }

        return res.status(200).json({ 
            message: "Booking updated successfully!",
            data: booking,
        });
    } catch (err) {
        console.error("Error updating booking:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Delete Booking
const deleteBooking = async (req, res) => {
    const { id } = req.params;

    try {
        const booking = await Booking.findByIdAndDelete(id);
        
        if (!booking) {
            return res.status(404).json({ message: "Unable to delete. Booking not found" });
        }

        return res.status(200).json({ message: "Booking deleted successfully!" });
    } catch (err) {
        console.error("Error deleting booking:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Export Controllers
module.exports = {
    getAllBookings,
    addBooking,
    getBookingById,
    updateBooking,
    deleteBooking
}; 