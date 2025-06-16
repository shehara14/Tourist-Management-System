const express = require("express");
const router = express.Router();

// Import Controller
const {
    getAllBookings,
    addBooking,
    getBookingById,
    updateBooking,
    deleteBooking
} = require("../Controllers/BookingController");

// Routes
router.get("/all", getAllBookings);
router.post("/create", addBooking);
router.get("/booking/:id", getBookingById);
router.put("/edit/:id", updateBooking);
router.delete("/delete/:id", deleteBooking);

module.exports = router; 