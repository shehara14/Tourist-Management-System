const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/userModel'); // Import the User model

class UserAuthController {
  // User registration
  async registerUser(req, res) {
    try {
      const { user_id, full_name, email, contact, address, dob, gender, user_type, password } = req.body;
  
      // Check if user already exists with the same email
      const existingUserEmail = await User.findOne({ email });
      if (existingUserEmail) {
        return res.status(409).json({ message: "This email is already registered" });
      }
  
      // Check if user already exists with the same contact
      const existingUserContact = await User.findOne({ contact });
      if (existingUserContact) {
        return res.status(409).json({ message: "This contact number is already registered" });
      }
  
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create new user
      const newUser = new User({
        user_id,
        full_name,
        email,
        contact,
        address,
        dob,
        gender,
        user_type: user_type || 'Traveler', // Default to 'Traveler' if not provided
        password: hashedPassword,
        profile_picture: req.file ? req.file.path : null,
        reset_token: null,
        reset_token_expiry: null,
      });
  
      await newUser.save();
      res.status(201).json({ 
        message: "User registered successfully",
        user: {
          id: newUser._id,
          user_id: newUser.user_id,
          full_name: newUser.full_name,
          email: newUser.email,
          user_type: newUser.user_type,
          profile_picture: newUser.profile_picture
        }
      });
    } catch (error) {
      if (error instanceof multer.MulterError) {
        return res.status(400).json({ message: 'File upload error: ' + error.message });
      }
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // User login
  async loginUser(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Update last_login field
      user.last_login = new Date();
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '1h' }
      );

      res.status(200).json({
        token,
        user: {
          id: user._id,
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          profile_picture: user.profile_picture,
          last_login: user.last_login,
          user_type: user.user_type
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Forgot password (unchanged)
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        // For security reasons, don't reveal that the email doesn't exist
        return res.status(200).json({ message: "If your email exists in our system, you will receive a password reset link" });
      }

      // Generate a reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = Date.now() + 86400000; // 24 hours from now

      // Update user with reset token and expiry
      user.reset_token = resetToken;
      user.reset_token_expiry = resetTokenExpiry;
      await user.save();

      // Create email transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER || 'your_email@gmail.com',
          pass: process.env.EMAIL_APP_PASSWORD || 'your_email_password',
        },
      });

      // Generate reset URL
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password/${resetToken}`;

      // Email options
      const mailOptions = {
        from: process.env.EMAIL_USER || 'your_email@gmail.com',
        to: user.email,
        subject: 'Password Reset Request',
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      };

      // Send email
      await transporter.sendMail(mailOptions);

      res.status(200).json({ message: "If your email exists in our system, you will receive a password reset link" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Reset password (unchanged)
  async resetPassword(req, res) {
    try {
      const token = req.params.token;
      const { password } = req.body;

      // Find user by reset token
      const user = await User.findOne({
        reset_token: token,
        reset_token_expiry: { $gt: Date.now() }, // Ensure token is not expired
      });

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update user password and clear reset token fields
      user.password = hashedPassword;
      user.reset_token = null;
      user.reset_token_expiry = null;
      await user.save();

      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Get all users
  async getAllUsers(req, res) {
    try {
      const users = await User.find().select('-password -reset_token -reset_token_expiry');
      res.status(200).json({ users });
    } catch (error) {
      res.status(500).json({ message: "Error fetching users", error: error.message });
    }
  }

  // Get a single user by ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findOne({ _id: id }).select('-password -reset_token -reset_token_expiry');

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ message: "Error fetching user", error: error.message });
    }
  }

  // Update a user by ID
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // If a file was uploaded, add the profile picture path
      if (req.file) {
        updateData.profile_picture = req.file.path;
      }

      // Find and update the user
      const updatedUser = await User.findOneAndUpdate({ _id: id }, updateData, {
        new: true, // Return the updated document
        runValidators: true, // Validate the update data
      }).select('-password -reset_token -reset_token_expiry');

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
      res.status(500).json({ message: "Error updating user", error: error.message });
    }
  }

  // Delete a user by ID
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const deletedUser = await User.findOneAndDelete({ _id: id });

      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // TODO: You might want to delete the profile picture file from storage here

      res.status(200).json({ message: "User deleted successfully", user: deletedUser });
    } catch (error) {
      res.status(500).json({ message: "Error deleting user", error: error.message });
    }
  }

  // Get user profile
  async getUserProfile(req, res) {
    try {
      // Extract the token from the Authorization header
      const token = req.headers.authorization?.split(' ')[1]; // Format: "Bearer <token>"
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      // Verify the token and extract the user ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      const userId = decoded.id;

      // Find the user by ID
      const user = await User.findById(userId).select('-password -reset_token -reset_token_expiry');
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return the user details
      res.status(200).json({ user });
    } catch (error) {
      console.error(error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Invalid token" });
      }
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      const userId = decoded.id;

      const { full_name, email, contact, address, dob, gender, user_type, password } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Validate email
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUserEmail = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUserEmail) {
          return res.status(409).json({ message: "This email is already registered" });
        }

        user.email = email;
      }

      // Validate contact
      if (contact) {
        const contactRegex = /^\d{10}$/;
        if (!contactRegex.test(contact)) {
          return res.status(400).json({ message: "Contact number must be 10 digits" });
        }

        const existingUserContact = await User.findOne({ contact, _id: { $ne: userId } });
        if (existingUserContact) {
          return res.status(409).json({ message: "This contact number is already registered" });
        }

        user.contact = contact;
      }

      // Update other fields
      if (full_name) user.full_name = full_name;
      if (address) user.address = address;
      if (dob) user.dob = dob;
      if (gender) user.gender = gender;
      if (user_type) user.user_type = user_type;

      // Update profile picture
      if (req.file) {
        user.profile_picture = req.file.path;
      }

      // Update password
      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }

      await user.save();

      const updatedUser = await User.findById(userId).select('-password -reset_token -reset_token_expiry');
      res.status(200).json({ 
        message: "Profile updated successfully", 
        user: updatedUser 
      });
    } catch (error) {
      console.error(error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Invalid token" });
      }
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Upload profile picture
  async uploadProfilePicture(req, res) {
    try {
      // Extract the token from the Authorization header
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      // Verify the token and extract the user ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      const userId = decoded.id;

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Find the user and update profile picture
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // TODO: Delete the old profile picture file if it exists

      // Update the profile picture path
      user.profile_picture = req.file.path;
      await user.save();

      // Return the updated user with profile picture URL
      const updatedUser = await User.findById(userId).select('-password -reset_token -reset_token_expiry');
      res.status(200).json({ 
        message: "Profile picture uploaded successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error(error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Invalid token" });
      }
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // User analysis - returns total users, gender breakdown and age categories
  async userAnalysis(req, res) {
    try {
      // Get all users (excluding sensitive data)
      const users = await User.find().select('-password -reset_token -reset_token_expiry');
      
      // Calculate total users
      const totalUsers = users.length;
      
      // Count users by gender
      // Using exact case as defined in the schema enum: 'Male', 'Female'
      const maleUsers = users.filter(user => user.gender === 'Male').length;
      const femaleUsers = users.filter(user => user.gender === 'Female').length;
      
      // Define age categories (6 categories starting from 18)
      const ageCategories = {
        '18-25': 0,
        '26-35': 0,
        '36-45': 0,
        '46-55': 0,
        '56-65': 0,
        '65+': 0
      };
      
      // Current date for age calculation
      const currentDate = new Date();
      
      // Calculate age for each user and increment appropriate category
      users.forEach(user => {
        if (!user.dob) return; // Skip if no date of birth
        
        const birthDate = new Date(user.dob);
        let age = currentDate.getFullYear() - birthDate.getFullYear();
        
        // Adjust age if birthday hasn't occurred yet this year
        const monthDiff = currentDate.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
          age--;
        }
        
        // Increment appropriate age category
        if (age >= 18 && age <= 25) ageCategories['18-25']++;
        else if (age >= 26 && age <= 35) ageCategories['26-35']++;
        else if (age >= 36 && age <= 45) ageCategories['36-45']++;
        else if (age >= 46 && age <= 55) ageCategories['46-55']++;
        else if (age >= 56 && age <= 65) ageCategories['56-65']++;
        else if (age > 65) ageCategories['65+']++;
      });
      
      // Calculate user activity metrics
      const activeUsers = {
        lastDay: 0,
        lastWeek: 0,
        lastMonth: 0
      };
      
      const now = new Date();
      const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
      
      users.forEach(user => {
        if (user.last_login) {
          const loginDate = new Date(user.last_login);
          if (loginDate >= oneDayAgo) activeUsers.lastDay++;
          if (loginDate >= oneWeekAgo) activeUsers.lastWeek++;
          if (loginDate >= oneMonthAgo) activeUsers.lastMonth++;
        }
      });
      
      // Return the analysis
      res.status(200).json({
        totalUsers,
        genderDistribution: {
          male: maleUsers,
          female: femaleUsers
        },
        ageDistribution: ageCategories,
        userActivity: {
          activeInLastDay: activeUsers.lastDay,
          activeInLastWeek: activeUsers.lastWeek,
          activeInLastMonth: activeUsers.lastMonth
        }
      });
      
    } catch (error) {
      console.error('Error in user analysis:', error);
      res.status(500).json({ message: "Error generating user analysis", error: error.message });
    }
  }
}

module.exports = new UserAuthController();