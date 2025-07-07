import React, { useState, useEffect } from 'react';
import {
  TextField, Button, MenuItem, FormControl, Select, InputLabel, Box,
  Typography, FormHelperText, 
  RadioGroup, FormControlLabel, Radio,
  Link, Avatar
} from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import DeleteIcon from '@material-ui/icons/Delete';
import swal from 'sweetalert';
import { makeStyles } from '@material-ui/core/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
    }
  },
  title: {
    fontFamily: '"Montserrat", sans-serif',
    fontWeight: 700,
    color: '#0000FF',
    textAlign: 'center',
    marginBottom: theme.spacing(4),
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
      transform: 'translateY(-2px)'
    }
  },
  loginLink: {
    fontWeight: 600,
    color: theme.palette.primary.dark,
    '&:hover': {
      textDecoration: 'none',
      color: theme.palette.primary.main
    }
  },
  requiredAvatar: {
    color: theme.palette.error.main,
    marginLeft: theme.spacing(0.5),
    fontSize: '0.8rem'
  }
}));

const UserRegistration = () => {
  const classes = useStyles();
  // State variables for form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [userType, setUserType] = useState('Traveler');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Function to generate user ID
  const generateUserId = () => {
    const randomNum = Math.floor(10000000 + Math.random() * 90000000);
    return `USR${randomNum}`;
  };

  // Generate user ID on component mount
  useEffect(() => {
    const newUserId = generateUserId();
    setUserId(newUserId);
  }, []);

  // Calculate minimum date (18 years ago from today)
  const today = new Date();
  const minDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  ).toISOString().split('T')[0];

  // Effect to check if all required fields are filled
  useEffect(() => {
    const requiredFields = {
      fullName,
      email,
      contact,
      address,
      dob,
      gender,
      userType,
      password,
      confirmPassword
    };

    const valid = Object.values(requiredFields).every(field => field !== '' && field !== null) && 
                  profilePicture !== null && 
                  password === confirmPassword;
    
    setIsFormValid(valid);
  }, [fullName, email, contact, address, dob, gender, userType, password, confirmPassword, profilePicture]);

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
      
      case 'userType':
        return value ? "" : "User type is required.";
      
      case 'password':
        return value ? "" : "Password is required.";
      
      case 'confirmPassword':
        if (!value) return "Confirm password is required.";
        return value === password ? "" : "Passwords do not match.";
      
      case 'profilePicture':
        return value ? "" : "Profile picture is required.";
      
      default:
        return "";
    }
  };

  // Generic handler for blur events
  const handleBlur = (fieldName, value) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    const errorMessage = validateField(fieldName, value);
    setErrors(prev => ({ ...prev, [fieldName]: errorMessage }));
  };

  // Field-specific handlers
  const handleChange = (fieldName, value) => {
    switch(fieldName) {
      case 'fullName':
        setFullName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'contact':
        setContact(value);
        break;
      case 'address':
        setAddress(value);
        break;
      case 'dob':
        setDob(value);
        break;
      case 'gender':
        setGender(value);
        handleBlur('gender', value);
        break;
      case 'userType':
        setUserType(value);
        handleBlur('userType', value);
        break;
      case 'password':
        setPassword(value);
        if (touchedFields.confirmPassword) {
          handleBlur('confirmPassword', confirmPassword);
        }
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
      default:
        break;
    }
  };

  // Handle profile picture upload
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrors(prevErrors => ({
        ...prevErrors,
        profilePicture: "Only JPG, JPEG, and PNG files are allowed"
      }));
      setTouchedFields(prev => ({ ...prev, profilePicture: true }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors(prevErrors => ({
        ...prevErrors,
        profilePicture: "File size must be less than 2MB"
      }));
      setTouchedFields(prev => ({ ...prev, profilePicture: true }));
      return;
    }

    setProfilePicture(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    setTouchedFields(prev => ({ ...prev, profilePicture: true }));
    setErrors(prevErrors => ({ ...prevErrors, profilePicture: '' }));
  };

  // Remove profile picture
  const handleRemoveProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview('');
    setTouchedFields(prev => ({ ...prev, profilePicture: true }));
    setErrors(prevErrors => ({ ...prevErrors, profilePicture: 'Profile picture is required' }));
  };

  const validateForm = () => {
    const allFields = {
      fullName,
      email,
      contact,
      address,
      dob,
      gender,
      userType,
      password,
      confirmPassword,
      profilePicture
    };
    
    const newErrors = {};
    Object.entries(allFields).forEach(([fieldName, value]) => {
      const errorMessage = validateField(fieldName, value);
      if (errorMessage) {
        newErrors[fieldName] = errorMessage;
      }
    });
    
    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const allFieldsTouched = {};
      Object.keys(validationErrors).forEach(field => {
        allFieldsTouched[field] = true;
      });
      setTouchedFields(prev => ({ ...prev, ...allFieldsTouched }));
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("full_name", fullName);
      formData.append("email", email);
      formData.append("contact", contact);
      formData.append("address", address);
      formData.append("dob", new Date(dob).toISOString());
      formData.append("gender", gender);
      formData.append("user_type", userType);
      formData.append("password", password);
      formData.append("profile_picture", profilePicture);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      await axios.post('http://127.0.0.1:5000/user/register', formData, config);
      
      swal({
        title: "Success",
        text: "User registered successfully!",
        icon: "success",
        timer: 2000,
        buttons: false
      }).then(() => {
        navigate('/login');
      });

      setFullName('');
      setEmail('');
      setContact('');
      setAddress('');
      setDob('');
      setGender('Male');
      setUserType('Traveler');
      setPassword('');
      setConfirmPassword('');
      setProfilePicture(null);
      setProfilePicturePreview('');
      setErrors({});
      setTouchedFields({});

      const newUserId = generateUserId();
      setUserId(newUserId);
    } catch (error) {
      console.error(error);
      swal("Error", error.response?.data?.message || "Something broke!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className={classes.root}>
      <Box className={classes.formContainer}>
        <Typography variant="h4" className={classes.title}>
          Join TravelMate
        </Typography>

        <Box component="form" noValidate encType="multipart/form-data" onSubmit={handleSubmit}>
          {/* Profile Picture Section */}
          <Box className={classes.avatarContainer}>
            <Box display="flex" alignItems="center" mb={1}>
              <Typography variant="subtitle1">Profile Picture</Typography>
              <Typography className={classes.requiredAvatar}>*</Typography>
            </Box>
            
            <Avatar
              src={profilePicturePreview}
              className={classes.avatar}
              alt={fullName || "Profile"}
            />
            
            <Box display="flex" alignItems="center">
              <input
                accept="image/jpeg,image/png,image/jpg"
                style={{ display: 'none' }}
                id="profile-picture-upload"
                type="file"
                onChange={handleProfilePictureChange}
              />
              <label htmlFor="profile-picture-upload">
                <Button
                  variant="contained"
                  color="primary"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  size="small"
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

          {/* User ID field */}
          <TextField
            fullWidth
            margin="normal"
            label="User ID"
            variant="outlined"
            value={userId}
            InputProps={{
              readOnly: true,
              style: {
                backgroundColor: '#f5f5f5',
                color: '#616161',
                cursor: 'not-allowed',
              },
            }}
            helperText="System generated ID (cannot be modified)"
          />

          <TextField
            fullWidth
            margin="normal"
            label="Full Name"
            variant="outlined"
            value={fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            onBlur={() => handleBlur('fullName', fullName)}
            helperText={touchedFields.fullName && errors.fullName ? errors.fullName : ''}
            error={!!(touchedFields.fullName && errors.fullName)}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email', email)}
            helperText={touchedFields.email && errors.email ? errors.email : ''}
            error={!!(touchedFields.email && errors.email)}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="Contact Number"
            variant="outlined"
            value={contact}
            onChange={(e) => handleChange('contact', e.target.value)}
            onBlur={() => handleBlur('contact', contact)}
            helperText={touchedFields.contact && errors.contact ? errors.contact : ''}
            error={!!(touchedFields.contact && errors.contact)}
            inputProps={{ maxLength: 10, pattern: "[0-9]{10}" }}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="Address"
            variant="outlined"
            multiline
            rows={3}
            value={address}
            onChange={(e) => handleChange('address', e.target.value)}
            onBlur={() => handleBlur('address', address)}
            helperText={touchedFields.address && errors.address ? errors.address : ''}
            error={!!(touchedFields.address && errors.address)}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="Date of Birth"
            type="date"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={dob}
            onChange={(e) => handleChange('dob', e.target.value)}
            onBlur={() => handleBlur('dob', dob)}
            inputProps={{ max: minDate }}
            helperText={(touchedFields.dob && errors.dob) ? errors.dob : "Must be at least 18 years old"}
            error={!!(touchedFields.dob && errors.dob)}
            required
          />

          <FormControl component="fieldset" margin="normal" error={!!(touchedFields.gender && errors.gender)} required fullWidth>
            <Typography variant="subtitle1">Gender</Typography>
            <RadioGroup
              aria-label="gender"
              name="gender"
              value={gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              row
            >
              <FormControlLabel value="Male" control={<Radio />} label="Male" />
              <FormControlLabel value="Female" control={<Radio />} label="Female" />
            </RadioGroup>
            <FormHelperText>{touchedFields.gender && errors.gender ? errors.gender : ''}</FormHelperText>
          </FormControl>

          {/* New User Type Field */}
          <FormControl fullWidth margin="normal" error={!!(touchedFields.userType && errors.userType)} required>
            <InputLabel>User Type</InputLabel>
            <Select
              value={userType}
              onChange={(e) => handleChange('userType', e.target.value)}
              onBlur={() => handleBlur('userType', userType)}
              label="User Type"
              variant='outlined'
            >
              <MenuItem value="Traveler">Traveler</MenuItem>
              <MenuItem value="Driver">Driver</MenuItem>
              <MenuItem value="Vehicle Owner">Vehicle Owner</MenuItem>
            </Select>
            <FormHelperText>{touchedFields.userType && errors.userType ? errors.userType : ''}</FormHelperText>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password', password)}
            helperText={(touchedFields.password && errors.password) ? errors.password : "At least 8 characters"}
            error={!!(touchedFields.password && errors.password)}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="Confirm Password"
            type="password"
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            onBlur={() => handleBlur('confirmPassword', confirmPassword)}
            helperText={touchedFields.confirmPassword && errors.confirmPassword ? errors.confirmPassword : ''}
            error={!!(touchedFields.confirmPassword && errors.confirmPassword)}
            required
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            type="submit"
            className={classes.submitButton}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
          
          <Box mt={4} textAlign="center">
            <Typography variant="body1">
              Already have an account?{' '}
              <Link href="/login" className={classes.loginLink}>
                Sign in here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UserRegistration;

