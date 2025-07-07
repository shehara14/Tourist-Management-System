import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Box, Typography, FormHelperText,
  RadioGroup, FormControlLabel, Radio, Avatar, CircularProgress,
  FormControl, Link
} from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import DeleteIcon from '@material-ui/icons/Delete';
import axios from 'axios';
import swal from 'sweetalert';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3),
    backgroundImage: 'url(https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
    }
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: theme.shadows[10],
    width: '100%',
    maxWidth: '600px',
    padding: theme.spacing(4),
    position: 'relative',
    zIndex: 1,
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(3),
    },
    border: '2px solid #3f51b5', // Added border styling
    '&:before': { // Added decorative corner elements
      content: '""',
      position: 'absolute',
      top: -10,
      left: -10,
      right: -10,
      bottom: -10,
      border: '2px solid #3f51b5',
      borderRadius: theme.shape.borderRadius * 2 + 4,
      zIndex: -1,
      opacity: 0.5
    },
    '&:after': { // Added another decorative layer
      content: '""',
      position: 'absolute',
      top: -15,
      left: -15,
      right: -15,
      bottom: -15,
      border: '2px solid #3f51b5',
      borderRadius: theme.shape.borderRadius * 2 + 8,
      zIndex: -2,
      opacity: 0.3
    }
  },
  title: {
    fontFamily: '"Montserrat", sans-serif',
    fontWeight: 700,
    color: theme.palette.primary.main,
    textAlign: 'center',
    marginBottom: theme.spacing(4),
    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
    color: '#0000FF',
    textAlign: 'center',
    marginBottom: theme.spacing(4),
    position: 'relative',
    '&:after': { // Added underline effect
      content: '""',
      position: 'absolute',
      bottom: -10,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '80px',
      height: '4px',
      backgroundColor: '#0000FF',
      borderRadius: '2px'
    }
  },
  avatarContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: theme.spacing(3)
  },
  avatar: {
    width: 120,
    height: 120,
    border: '3px solid #e0e0e0',
    boxShadow: theme.shadows[3],
    marginBottom: theme.spacing(2)
  },
  submitButton: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(1.5),
    fontSize: '1rem',
    fontWeight: 600,
    letterSpacing: 1.1,
    borderRadius: 50,
    boxShadow: theme.shadows[2],
    '&:hover': {
      boxShadow: theme.shadows[4],
      transform: 'translateY(-2px)',
      backgroundColor: theme.palette.primary.dark
    },
    transition: 'all 0.3s ease' // Added smooth transition
  },
  loginLink: {
    fontWeight: 600,
    color: theme.palette.primary.dark,
    '&:hover': {
      textDecoration: 'none',
      color: theme.palette.primary.main
    }
  },
  inputField: { // Added styling for input fields
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#3f51b5',
        borderWidth: '1px'
      },
      '&:hover fieldset': {
        borderColor: '#3f51b5',
        borderWidth: '1px'
      },
      '&.Mui-focused fieldset': {
        borderColor: '#3f51b5',
        borderWidth: '1px'
      }
    }
  },
  requiredAvatar: {
    color: theme.palette.error.main,
    marginLeft: theme.spacing(0.5),
    fontSize: '0.8rem'
  }
}));

const EditProfile = () => {
  const classes = useStyles();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contact: '',
    address: '',
    dob: '',
    gender: '',
    password: '',
    confirmPassword: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({}); // Track which fields have been touched
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();

  // Calculate minimum date (18 years ago from today)
  const today = new Date();
  const minDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  ).toISOString().split('T')[0];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const userData = response.data.user;
  
        setFormData({
          fullName: userData.full_name,
          email: userData.email,
          contact: userData.contact,
          address: userData.address,
          dob: userData.dob.split('T')[0],
          gender: userData.gender,
          password: '',
          confirmPassword: ''
        });
        
        if (userData.profile_picture) {
          setProfilePicturePreview(`http://localhost:5000/${userData.profile_picture}`);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        swal('Error', 'Failed to fetch user data. Please try again.', 'error');
      }
    };
  
    fetchUserData();
  }, []);

  // Validate field and return error message if invalid
  const validateField = (fieldName, value) => {
    switch(fieldName) {
      case 'email':
        if (!value) return "Email is required.";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? "" : "Invalid email format";
      
      case 'contact':
        if (!value) return "Contact number is required.";
        const contactRegex = /^\d{10}$/;
        return contactRegex.test(value) ? "" : "Contact number must be 10 digits";
      
      case 'fullName':
        return value ? "" : "Full name is required.";
      
      case 'address':
        return value ? "" : "Address is required.";
      
      case 'dob':
        if (!value) return "Date of birth is required.";
        const birthDate = new Date(value);
        const ageDate = new Date(today - birthDate);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        return age >= 18 ? "" : "User must be at least 18 years old.";
      
      case 'gender':
        return value ? "" : "Gender is required.";
      
      case 'password':
        // Password is optional in edit mode, but if provided must be at least 8 chars
        return value && value.length < 8 ? "Password must be at least 8 characters." : "";
      
      case 'confirmPassword':
        // Only validate if password is provided
        if (!formData.password) return "";
        return value === formData.password ? "" : "Passwords do not match.";
      
      case 'profilePicture':
        // Profile picture validation is not required for edit mode
        return "";
      
      default:
        return "";
    }
  };

  // Generic handler for blur events
  const handleBlur = (fieldName, value) => {
    // Mark the field as touched
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    
    // Validate the field
    const errorMessage = validateField(fieldName, value);
    
    // Update errors state
    setErrors(prev => ({ ...prev, [fieldName]: errorMessage }));
  };

  // Check form validity whenever form data changes
  useEffect(() => {
    const basicFieldsValid = 
      formData.fullName && 
      formData.email && 
      formData.contact && 
      formData.address && 
      formData.dob && 
      formData.gender;
    
    const passwordFieldsValid = 
      !formData.password || // Password is optional in edit mode
      (formData.password && formData.password.length >= 8 && formData.confirmPassword === formData.password);
    
    // No validation errors
    const noValidationErrors = Object.values(errors).every(error => !error);
    
    setIsFormValid(basicFieldsValid && passwordFieldsValid && noValidationErrors);
  }, [formData, errors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // If confirm password depends on password, revalidate it
    if (name === 'password' && touchedFields.confirmPassword) {
      handleBlur('confirmPassword', formData.confirmPassword);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, profilePicture: "Only JPG, JPEG, and PNG files are allowed" }));
      setTouchedFields(prev => ({ ...prev, profilePicture: true }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, profilePicture: "File size must be less than 2MB" }));
      setTouchedFields(prev => ({ ...prev, profilePicture: true }));
      return;
    }

    setProfilePicture(file);
    setErrors(prev => ({ ...prev, profilePicture: '' }));
    setTouchedFields(prev => ({ ...prev, profilePicture: true }));

    const reader = new FileReader();
    reader.onload = () => setProfilePicturePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview('');
    // No error needed for removing profile picture in edit mode
    setErrors(prev => ({ ...prev, profilePicture: '' }));
    setTouchedFields(prev => ({ ...prev, profilePicture: true }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate all fields
    Object.keys(formData).forEach(fieldName => {
      const errorMessage = validateField(fieldName, formData[fieldName]);
      if (errorMessage) {
        newErrors[fieldName] = errorMessage;
      }
    });
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFieldsTouched = {};
    Object.keys(formData).forEach(field => {
      allFieldsTouched[field] = true;
    });
    setTouchedFields(prev => ({ ...prev, ...allFieldsTouched }));
    
    // Validate all fields
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
  
    setIsSubmitting(true);
  
    const data = new FormData();
    data.append('full_name', formData.fullName);
    data.append('email', formData.email);
    data.append('contact', formData.contact);
    data.append('address', formData.address);
    data.append('dob', formData.dob);
    data.append('gender', formData.gender);
    if (formData.password) data.append('password', formData.password);
    if (profilePicture) data.append('profile_picture', profilePicture);
  
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:5000/user/profile', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
  
      // Update local storage with the new user information
      const updatedUser = response.data.user || {};
      const firstName = formData.fullName.split(' ')[0];
      
      localStorage.setItem('username', firstName);
      localStorage.setItem('userEmail', formData.email);
      
      // Update profile picture in local storage if there's a new one
      if (profilePicture) {
        // If we have a response with the updated profile picture path
        if (response.data.user && response.data.user.profile_picture) {
          localStorage.setItem('profilePicture', `http://localhost:5000/${response.data.user.profile_picture}`);
        } 
        // If no path in response but we have a preview (this is a fallback)
        else if (profilePicturePreview) {
          localStorage.setItem('profilePicture', profilePicturePreview);
        }
      }
      
      // Dispatch login update event to notify the header component
      window.dispatchEvent(new CustomEvent('loginUpdate', {
        detail: { 
          username: firstName, 
          email: formData.email,
          profilePicture: profilePicture 
            ? (response.data.user && response.data.user.profile_picture 
                ? `http://localhost:5000/${response.data.user.profile_picture}` 
                : profilePicturePreview)
            : profilePicturePreview
        }
      }));
  
      swal({
        title: "Success",
        text: "Profile updated successfully!",
        icon: "success",
        timer: 2000,
        buttons: false
      });
      
      // Reset password fields after successful update
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
      
      // Reset touched state for password fields
      setTouchedFields(prev => ({
        ...prev,
        password: false,
        confirmPassword: false
      }));
      
    } catch (error) {
      console.error("Update error:", error);
      if (error.response?.status === 409) {
        const field = error.response.data.message.includes("email") ? "email" : "contact";
        swal("Error", error.response.data.message, "error");
        setErrors(prev => ({ ...prev, [field]: error.response.data.message }));
        setTouchedFields(prev => ({ ...prev, [field]: true }));
      } else {
        swal("Error", "Update failed. Please try again.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box className={classes.root}>
      <Box className={classes.formContainer}>
        <Typography variant="h4" className={classes.title}>
          Edit Profile
        </Typography>

        {/* Profile Picture Section */}
        <Box className={classes.avatarContainer}>
          <Box display="flex" alignItems="center" mb={1}>
            <Typography variant="subtitle1">Profile Picture</Typography>
          </Box>
          
          <Avatar
            src={profilePicturePreview}
            className={classes.avatar}
            alt={formData.fullName || "Profile"}
          />
          
          <Box display="flex" alignItems="center">
            <input
              accept="image/jpeg,image/png,image/jpg"
              id="profile-upload"
              type="file"
              style={{ display: 'none' }}
              onChange={handleProfilePictureChange}
            />
            <label htmlFor="profile-upload">
              <Button
                variant="contained"
                color="primary"
                component="span"
                startIcon={<CloudUploadIcon />}
                size="small"
                disabled={isSubmitting}
                style={{ marginRight: 8 }}
              >
                Upload
              </Button>
            </label>
            
            {profilePicturePreview && (
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<DeleteIcon />}
                onClick={handleRemoveProfilePicture}
                size="small"
                disabled={isSubmitting}
              >
                Remove
              </Button>
            )}
          </Box>
          
          {touchedFields.profilePicture && errors.profilePicture && (
            <Typography variant="caption" color="error" style={{ marginTop: 8 }}>
              {errors.profilePicture}
            </Typography>
          )}
          
          <Typography variant="caption" style={{ marginTop: 8, color: '#666' }}>
            Recommended: Square image, JPG or PNG, max 2MB
          </Typography>
        </Box>

        <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={() => handleBlur('fullName', formData.fullName)}
            error={!!(touchedFields.fullName && errors.fullName)}
            helperText={touchedFields.fullName && errors.fullName ? errors.fullName : ''}
            required
            className={classes.inputField}
            variant="outlined"
          />

          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => handleBlur('email', formData.email)}
            error={!!(touchedFields.email && errors.email)}
            helperText={touchedFields.email && errors.email ? errors.email : ''}
            required
            className={classes.inputField}
            variant="outlined"
          />

          <TextField
            fullWidth
            margin="normal"
            label="Contact Number"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            onBlur={() => handleBlur('contact', formData.contact)}
            inputProps={{ maxLength: 10, pattern: "[0-9]{10}" }}
            error={!!(touchedFields.contact && errors.contact)}
            helperText={touchedFields.contact && errors.contact ? errors.contact : ''}
            required
            className={classes.inputField}
            variant="outlined"
          />

          <TextField
            fullWidth
            margin="normal"
            label="Address"
            name="address"
            multiline
            rows={3}
            value={formData.address}
            onChange={handleChange}
            onBlur={() => handleBlur('address', formData.address)}
            error={!!(touchedFields.address && errors.address)}
            helperText={touchedFields.address && errors.address ? errors.address : ''}
            required
            className={classes.inputField}
            variant="outlined"
          />

          <TextField
            fullWidth
            margin="normal"
            label="Date of Birth"
            name="dob"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.dob}
            onChange={handleChange}
            onBlur={() => handleBlur('dob', formData.dob)}
            error={!!(touchedFields.dob && errors.dob)}
            helperText={(touchedFields.dob && errors.dob) ? errors.dob : "Must be at least 18 years old"}
            required
            className={classes.inputField}
            variant="outlined"
            inputProps={{ max: minDate }}
          />

          <FormControl component="fieldset" margin="normal" error={!!(touchedFields.gender && errors.gender)} required fullWidth>
            <Typography variant="subtitle1">Gender</Typography>
            <RadioGroup
              row
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              onBlur={() => handleBlur('gender', formData.gender)}
            >
              <FormControlLabel value="Male" control={<Radio color="primary" />} label="Male" />
              <FormControlLabel value="Female" control={<Radio color="primary" />} label="Female" />
            </RadioGroup>
            <FormHelperText>{touchedFields.gender && errors.gender ? errors.gender : ''}</FormHelperText>
          </FormControl>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            type="submit"
            className={classes.submitButton}
            disabled={!isFormValid || isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isSubmitting ? 'Updating...' : 'Update Profile'}
          </Button>

          <Box mt={4} textAlign="center">
            <Typography variant="body1">
              <Link href="/" className={classes.loginLink}>
                Back to Home
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EditProfile;