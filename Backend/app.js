const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Config
const { PORT, MONGODB_URI } = require('./config');

// Route Imports
const packageRoutes = require('./routes/packageRoutes');
const UserRoutes = require('./routes/userRoute');
const defaultPackageRouter = require("./Routes/Default_Package_Route");
const driverRouter = require("./Routes/driverRoutes");
const vehicleRouter = require("./Routes/vehicleRoutes");
const bookingRouter = require("./Routes/BookingRoutes");
const assignmentRoutes = require('./Routes/assignmentRoutes');
const router = require("./routes/RoutePayment"); 

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads', 'vehicles');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Serve static files from uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/packages', packageRoutes);
app.use("/user", UserRoutes);
app.use("/defaultPackage", defaultPackageRouter);
app.use("/driver", driverRouter);
app.use("/vehicle", vehicleRouter);
app.use("/booking", bookingRouter);
app.use("/api/assignments", assignmentRoutes);
app.use("/payment", router); 

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ message: 'File size is too large. Maximum allowed is 50MB' });
    }
    res.status(500).json({ message: 'Something broke!' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
