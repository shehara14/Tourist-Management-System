import React, { useState } from 'react';
import {
  TextField, Button, Box, Typography, Link
} from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import swal from 'sweetalert';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3),
    backgroundImage: 'url(https://img.freepik.com/free-photo/aerial-view-kelingking-beach-nusa-penida-island-bali-indonesia_335224-309.jpg?t=st=1744963377~exp=1744966977~hmac=1c45d117d7542046d58805d1c5f7e580b1b08d2a2f6831fdea14e522a2c1dc65&w=996)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed', // Creates parallax effect
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)', // Dark overlay for better text contrast
    }
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: theme.shadows[10],
    width: '100%',
    maxWidth: '450px',
    padding: theme.spacing(4),
    position: 'relative',
    zIndex: 1,
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(3),
    }
  },
  title: {
    fontFamily: '"Playfair Display", serif',
    fontWeight: 'bold',
    color: '#0000FF',
    textAlign: 'center',
    marginBottom: theme.spacing(4)
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
  }
}));

const Login = () => {
  const classes = useStyles();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [fieldTouched, setFieldTouched] = useState({
    email: false,
    password: false
  });
  const navigate = useNavigate();

  // Validate email format
  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  // Handle email change - just update state
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  // Handle email blur - validate when leaving field
  const handleEmailBlur = () => {
    setFieldTouched(prev => ({ ...prev, email: true }));
    
    if (!email) {
      setErrors(prevErrors => ({
        ...prevErrors,
        email: "Email is required"
      }));
    } else if (!validateEmail(email)) {
      setErrors(prevErrors => ({
        ...prevErrors,
        email: "Invalid email format"
      }));
    } else {
      setErrors(prevErrors => ({ ...prevErrors, email: '' }));
    }
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // Handle password blur
  const handlePasswordBlur = () => {
    setFieldTouched(prev => ({ ...prev, password: true }));
    
    if (!password) {
      setErrors(prevErrors => ({
        ...prevErrors,
        password: "Password is required"
      }));
    } else {
      setErrors(prevErrors => ({ ...prevErrors, password: '' }));
    }
  };

  // Validate the login form
  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!validateEmail(email)) {
      newErrors.email = "Invalid email format.";
    }
    
    if (!password) {
      newErrors.password = "Password is required.";
    }
    
    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    // Check if admin credentials are entered
    if (email === "admin@gmail.com" && password === "admin") {
      localStorage.setItem("username", "Admin");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userType", "Admin");
      
      window.dispatchEvent(new CustomEvent('loginUpdate', {
        detail: { username: "Admin", email, userType: "Admin" }
      }));
      
      swal("Success", "Logged in as Admin!", "success");
      navigate("/dashboard");
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:5000/user/login', {
        email,
        password
      });
  
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        if (response.data.user) {
          const fullName = response.data.user.full_name || '';
          const firstName = fullName.split(' ')[0];
          localStorage.setItem('username', firstName);
          localStorage.setItem('userEmail', response.data.user.email || '');
          localStorage.setItem('userId', response.data.user.id || '');
          localStorage.setItem('userType', response.data.user.user_type || 'Traveler');
          
          if (response.data.user.profile_picture) {
            localStorage.setItem('profilePicture', `http://localhost:5000/${response.data.user.profile_picture}`);
          }
          
          window.dispatchEvent(new CustomEvent('loginUpdate', {
            detail: { 
              username: firstName, 
              email: response.data.user.email,
              userType: response.data.user.user_type,
              profilePicture: response.data.user.profile_picture 
                ? `http://localhost:5000/${response.data.user.profile_picture}`
                : null
            }
          }));

          // Navigate based on user type
          switch(response.data.user.user_type) {
            case 'Traveler':
              navigate('/');
              break;
            case 'Driver':
              navigate('/driver-dashboard');
              break;
            case 'Vehicle Owner':
              navigate('/owner-dashboard');
              break;
            default:
              navigate('/dashboard');
          }
        }
        
        swal("Success", "Logged in successfully!", "success");
  
        // Set timeout to clear local storage after 1 hour
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userId');
          localStorage.removeItem('userType');
          window.dispatchEvent(new CustomEvent('loginUpdate', {
            detail: { username: 'User', email: '', userType: '' }
          }));
          swal("Session Expired", "Please login again.", "warning");
          navigate('/login');
        }, 3600000);
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 401) {
        swal("Error", "Invalid email or password", "error");
      } else {
        swal("Error", "Something went wrong. Please try again.", "error");
      }
    }
  };

  return (
    <Box className={classes.root}>
      <Box className={classes.formContainer}>
        <Typography 
          variant="h4" 
          className={classes.title}
        >
          Login to TravelMate
        </Typography>

        <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            variant="outlined"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            helperText={errors.email}
            error={!!errors.email}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={handlePasswordChange}
            onBlur={handlePasswordBlur}
            helperText={errors.password}
            error={!!errors.password}
            required
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            type="submit"
            className={classes.submitButton}
          >
            Login
          </Button>

          <Box mt={2} textAlign="center">
            <Link href="/forgot-password" style={{ marginRight: '10px' }}>
              Forgot Password?
            </Link>
          </Box>

          <Box mt={4} textAlign="center">
            <Typography variant="body1">
              Don't have an account?{' '}
              <Link href="/register" className={classes.loginLink}>
                Register here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;