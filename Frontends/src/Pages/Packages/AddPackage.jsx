import React, { useState, useEffect } from 'react';
import { 
  TextField, Button, MenuItem, FormControl, Select, InputLabel, Box, Typography, 
  FormHelperText, Grid, Divider, IconButton, Card, CardContent, Chip, Checkbox,
  FormControlLabel
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { Add, Delete, AddPhotoAlternate, Remove } from '@material-ui/icons';
import Sidebar from '../../Components/sidebar';
import Header from '../../Components/guest_header'; 
import axios from 'axios';
import swal from 'sweetalert';

const AddTourPackage = () => {
  // Main package details
  const [packageId, setPackageId] = useState('');
  const [packageName, setPackageName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [district, setDistrict] = useState('');
  const [packageImage, setPackageImage] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [useImageUrl, setUseImageUrl] = useState(true);
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Place details
  const [places, setPlaces] = useState([]);
  const [currentPlace, setCurrentPlace] = useState({
    name: '',
    description: '',
    image: '', 
    images: [],
    placeType: [],
    suitableFor: {
      ageRange: { min: 1, max: 100 },
      hobbies: [],
      climate: 'Tropical', 
      healthConsiderations: {
        notRecommendedFor: [],
        specialFacilities: []
      }
    },
    location: {
      type: 'Point',
      coordinates: [0, 0]
    }
  });
  const [placeImage, setPlaceImage] = useState('');
  const [placeErrors, setPlaceErrors] = useState({});

  // Effect to check if all required fields are filled
  useEffect(() => {
    const requiredFields = {
      packageId,
      packageName,
      description,
      duration,
      district,
    };
    
    const imageValid = useImageUrl ? packageImage !== '' : uploadedImage !== null;
    const valid = Object.values(requiredFields).every(field => field !== '') && imageValid;
    setIsFormValid(valid);
  }, [packageId, packageName, description, duration, district, packageImage, uploadedImage, useImageUrl]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await axios.post('http://localhost:5000/api/packages/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        setUploadedImage(file);
        setPackageImage(response.data.imageUrl);
        setUseImageUrl(false);
      } catch (error) {
        console.error('Error uploading image:', error);
        swal("Error", "Failed to upload image. Please try again.", "error");
      }
    }
  };

  const toggleImageSource = () => {
    setUseImageUrl(!useImageUrl);
    if (useImageUrl) {
      setPackageImage('');
    } else {
      setUploadedImage(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!packageId) newErrors.packageId = "Package ID is required.";
    if (!packageName) newErrors.packageName = "Package Name is required.";
    if (!description) newErrors.description = "Description is required.";
    if (!duration) newErrors.duration = "Duration is required.";
    if (isNaN(duration)) newErrors.duration = "Duration must be a number.";
    if (!district) newErrors.district = "District is required.";
    
    if (useImageUrl && !packageImage) {
      newErrors.packageImage = "Package Image URL is required.";
    } else if (!useImageUrl && !uploadedImage) {
      newErrors.packageImage = "Please upload an image.";
    }
    
    return newErrors;
  };

  const validatePlace = () => {
    const newErrors = {};
    if (!currentPlace.name) newErrors.name = "Place name is required.";
    if (!currentPlace.description) newErrors.description = "Place description is required.";
    if (!currentPlace.image) newErrors.images = "Image URL is required.";
    if (currentPlace.suitableFor.hobbies.length === 0) newErrors.hobbies = "At least one hobby is required.";
    if (!currentPlace.suitableFor.climate) newErrors.climate = "Climate is required.";
    if (currentPlace.placeType.length === 0) newErrors.placeType = "At least one place type is required.";
    
    if (!currentPlace.location.coordinates[0] || !currentPlace.location.coordinates[1]) {
      newErrors.location = "Location coordinates are required.";
    }
    if (Math.abs(currentPlace.location.coordinates[1]) > 90) {
      newErrors.latitude = "Latitude must be between -90 and 90 degrees";
    }
    if (Math.abs(currentPlace.location.coordinates[0]) > 180) {
      newErrors.longitude = "Longitude must be between -180 and 180 degrees";
    }
    
    return newErrors;
  };

  const handleAddPlaceImage = () => {
    if (placeImage.trim()) {
      setCurrentPlace({
        ...currentPlace,
        images: [...currentPlace.images, placeImage.trim()]
      });
      setPlaceImage('');
      if (placeErrors.images) {
        setPlaceErrors(prev => ({ ...prev, images: '' }));
      }
    }
  };

  const handleRemovePlaceImage = (index) => {
    const updatedImages = [...currentPlace.images];
    updatedImages.splice(index, 1);
    setCurrentPlace({
      ...currentPlace,
      images: updatedImages
    });
  };

  const handleAddPlace = () => {
    const validationErrors = validatePlace();
    if (Object.keys(validationErrors).length > 0) {
      setPlaceErrors(validationErrors);
      return;
    }
    
    // Create a new place object with all the current place data
    const newPlace = {
      ...currentPlace,
    };
    
    // If there's a main image, add it to the images array if it's not already there
    if (newPlace.image && !newPlace.images.includes(newPlace.image)) {
      newPlace.images = [newPlace.image, ...newPlace.images];
    }
    
    setPlaces([...places, newPlace]);
    
    // Reset the current place form
    setCurrentPlace({
      name: '',
      description: '',
      image: '', // Reset single image input
      images: [], // Reset images array
      placeType: [],
      suitableFor: {
        ageRange: { min: 1, max: 100 },
        hobbies: [],
        climate: ['Tropical'],
        healthConsiderations: {
          notRecommendedFor: [],
          specialFacilities: []
        }
      },
      location: {
        type: 'Point',
        coordinates: [0, 0]
      }
    });
    setPlaceErrors({});
  };

  const handleRemovePlace = (index) => {
    const updatedPlaces = [...places];
    updatedPlaces.splice(index, 1);
    setPlaces(updatedPlaces);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    try {
      let imageUrl = packageImage;
      
      if (!useImageUrl && uploadedImage) {
        const formData = new FormData();
        formData.append('image', uploadedImage);
        
        const uploadResponse = await axios.post('http://localhost:5000/api/packages/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        imageUrl = uploadResponse.data.imageUrl;
      }
  
      const newPackage = {
        package_id: packageId,
        name: packageName,
        description,
        duration: Number(duration),
        packageImage: imageUrl,
        district,
        places: places.map(place => ({
          ...place,
          location: {
            type: 'Point',
            coordinates: place.location.coordinates.map(Number)
          }
        }))
      };
  
      const response = await axios.post('http://localhost:5000/api/packages', newPackage);
      console.log('Response:', response.data);
      
      swal("Success", "New tour package added successfully!", "success");
      // Reset form fields
      setPackageId('');
      setPackageName('');
      setDescription('');
      setDuration('');
      setDistrict('');
      setPackageImage('');
      setUploadedImage(null);
      setPlaces([]);
      setErrors({});
    } catch (error) {
      console.error('Error creating package:', error);
      
      if (error.response && error.response.status === 400) {
        swal("Error", error.response.data.message, "error");
        setErrors(prevErrors => ({ 
          ...prevErrors, 
          packageId: "A package with this ID already exists" 
        }));
      } else {
        swal("Error", "Something went wrong. Please try again.", "error");
      }
    }
  };

  // List of Sri Lankan districts
  const districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar', 
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee', 
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 
    'Monaragala', 'Ratnapura', 'Kegalle'
  ];

  // Place types
  const placeTypes = ['Beach', 'Mountains', 'Waterfalls', 'Religious', 'Historical', 'Urban', 'Wildlife', 'Nature', 'Adventure', 'Educational', 'Museum', 'Scenic',
    'Cultural', 'Family', 'Photography', 'Snorkeling', 'Romantic', 'Eco-Tourism', 'Diving', 'Surfing', 'Relaxation', 'Safari', 'Garden', 'Park', 'Architecture',
    'Sports', 'Recreation', 'Water Activities', 'Viewpoint', 'Entertainment', 'Shopping', 'Agriculture', 'Food', 'Natural Wonder'];
  

  // Hobbies
  const hobbies = [
    'Hiking', 'Surfing', 'Camping', 'Sightseeing', 'Adventure', 
    'Photography', 'Shopping', 'Relaxation', 'Learning', 
    'Bird Watching', 'Tea Tasting', 'Cultural Exploration', 
    'Boating', 'Walking', 'Swimming', 'Snorkeling', 
    'Wildlife', 'Conservation', 'Geology', 'Instagram', 
    'Yoga', 'Sunbathing', 'Reading', 'Kayaking', 
    'Whale Watching', 'Exploration', 'Marine Life', 
    'History', 'Scuba Diving', 'Nature Walks', 
    'Golf', 'Horse Racing', 'Food Tasting', 
    'Nature Exploration', 'Dining'
  ];

  // Climate types
  const climateTypes = [
    'Tropical', 'Temperate', 'Arid', 'Cold'
  ];

  // Health considerations
  const healthConditions = [
    'Asthma', 'Back Pain', 'Knee Pain', 'Heart Condition', 'Seasickness', 'Non-swimmers', 'Mobility Issues', 'Strong Currents', 'Dust Allergies', 'Mosquito-Borne Illnesses', 'Severe Pollen Allergies', 'Respiratory Issues', 'Joint Problems', 'Heart Conditions', 'Swimming Difficulties', 'Hearing Impairments', 'Severe Allergies'
  ];

  // Special facilities
  const specialFacilities = [
    'Wheelchair Access', 'Elevators', 'Rest Areas', 
    'Medical Support', 'Shuttle Service'
  ];

  const generatePackageId = (district) => {
    // Get first 3 letters of district (uppercase)
    const districtAbbr = district ? district.slice(0, 3).toUpperCase() : 'PKG';
    
    // Get current timestamp (last 4 digits)
    const timestamp = Date.now().toString().slice(-4);
    
    // Generate a random 3-character string
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
    
    return `${districtAbbr}-${timestamp}-${randomStr}`;
  };

  useEffect(() => {
    // Auto-generate a default ID on component mount
    if (!packageId) {
      setPackageId(generatePackageId(''));
    }
  }, []);

  return (
    <Box>
      <Box display="flex" style={{ backgroundColor: '#f5f5f5'}}>
        <Sidebar />
        <Box
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          p={2}
          style={{ backgroundColor: 'white', borderRadius: 8, boxShadow: '0px 0px 10px rgba(0,0,0,0.1)', flex: 1, margin: '15px' }}
        >
          {/* Title Section */}
          <Box
            alignItems="center"
            justifyContent="center"
          >
            <Typography variant="h4" gutterBottom style={{ fontFamily: 'cursive', fontWeight: 'bold', color: '#0000FF', textAlign: 'center', marginTop:'30px', marginBottom:'50px' }}>
              Add New Tour Package
            </Typography>
          </Box>

          <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Left side - Package Details */}
              <Grid item xs={12} md={6} style={{padding:'30px'}}>
                <Typography variant="h6" gutterBottom style={{ color: '#555' }}>
                  Package Details
                </Typography>
                
                {/* Package Details Form Fields */}
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Package ID"
                    variant="outlined"
                    value={packageId}
                    onChange={(e) => {
                      setPackageId(e.target.value);
                      if (errors.packageId) {
                        setErrors(prevErrors => ({ ...prevErrors, packageId: '' }));
                      }
                    }}
                    helperText={errors.packageId}
                    error={!!errors.packageId}
                    required
                    InputProps={{
                      readOnly: true, // Prevents manual editing
                    }}
                    disabled
                  />
                  </Grid>
                  <Grid item xs={12}>
                  <TextField
                      fullWidth
                      margin="normal"
                      label="Package Name"
                      variant="outlined"
                      value={packageName}
                      onChange={(e) => {
                        // Remove any numbers from the input
                        const filteredValue = e.target.value.replace(/[0-9]/g, '');
                        setPackageName(filteredValue);
                        if (errors.packageName) {
                          setErrors(prevErrors => ({ ...prevErrors, packageName: '' }));
                        }
                      }}
                      helperText={errors.packageName}
                      error={!!errors.packageName}
                      required
                      inputProps={{
                        pattern: "[A-Za-z]*",  // HTML5 pattern to prevent numbers (though onChange handles it)
                        title: "Numbers are not allowed in package name"  // Message shown when pattern fails
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Description"
                      variant="outlined"
                      multiline
                      rows={4}
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        if (errors.description) {
                          setErrors(prevErrors => ({ ...prevErrors, description: '' }));
                        }
                      }}
                      helperText={errors.description}
                      error={!!errors.description}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Duration (days)"
                    variant="outlined"
                    type="text" // Changed from "number" to "text"
                    value={duration}
                    onChange={(e) => {
                      // Remove all non-digit characters
                      const sanitizedValue = e.target.value.replace(/[^0-9]/g, '');
                      
                      // Only proceed if we have a valid number
                      if (sanitizedValue !== '') {
                        const numericValue = parseInt(sanitizedValue, 10);
                        
                        // Validate range (1-30)
                        if (!isNaN(numericValue)) {
                          const clampedValue = Math.min(Math.max(1, numericValue), 30);
                          setDuration(clampedValue.toString());
                          
                          // Clear any existing errors
                          if (errors.duration) {
                            setErrors(prevErrors => ({ ...prevErrors, duration: '' }));
                          }
                        }
                      } else {
                        // Handle empty input
                        setDuration('');
                      }
                    }}
                    onBlur={(e) => {
                      // Ensure value is not empty or invalid
                      if (!duration || parseInt(duration) < 1) {
                        setDuration('1');
                      }
                    }}
                    inputProps={{
                      inputMode: 'numeric', // Shows numeric keyboard on mobile
                      pattern: '[0-9]*',   // Helps with numeric input validation
                    }}
                    helperText={errors.duration}
                    error={!!errors.duration}
                    required
                  />
                                    </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal" variant="outlined" error={!!errors.district} required>
                      <InputLabel>District</InputLabel>
                      <Select
                        value={district}
                        onChange={(e) => {
                          const selectedDistrict = e.target.value;
                          setDistrict(selectedDistrict);
                          // Auto-generate Package ID when district is selected
                          setPackageId(generatePackageId(selectedDistrict));
                          if (errors.district) {
                            setErrors(prevErrors => ({ ...prevErrors, district: '' }));
                          }
                        }}
                        label="District"
                      >
                        {districts.map((district) => (
                          <MenuItem key={district} value={district}>
                            {district}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>{errors.district}</FormHelperText>
                    </FormControl>
                  </Grid>
                </Grid>
                
                <Box mt={2}>
                  <Typography variant="body1" style={{ textAlign: 'left', marginBottom: '15px', color: '#666' }}>
                    <strong>Note:</strong> After adding the package, you can:
                  </Typography>
                  <Typography variant="body2" style={{ textAlign: 'left', color: '#666' }}>
                    • Add more places to this package from the package details page<br />
                    • Edit package information<br />
                    • Manage recommendations and promotions<br />
                    • View package performance metrics
                  </Typography>
                </Box>

                <Divider style={{ margin: '20px 0' }} />

                <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>
                  Added Places
                </Typography>
                
                {places.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">
                    No places added yet.
                  </Typography>
                ) : (
                  <Box sx={{ maxHeight: '1000px', overflow: 'auto' }}>
                    {places.map((place, index) => (
                      <Card variant="outlined" key={index} style={{ marginBottom: '10px' }}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">{place.name}</Typography>
                            <IconButton size="small" onClick={() => handleRemovePlace(index)}>
                              <Delete />
                            </IconButton>
                          </Box>
                          <Typography variant="body2" color="textSecondary">
                            Types: {place.placeType.join(', ')}
                          </Typography>
                          <Typography variant="body2">
                            {place.description}
                          </Typography>
                          <Typography variant="body2" style={{ marginTop: '8px' }}>
                            Location: {place.location.coordinates[0]}, {place.location.coordinates[1]}
                          </Typography>
                          <Box display="flex" flexWrap="wrap" mt={1}>
                          {Array.isArray(place.images) && place.images.length > 0 ? (
                            <>
                              {place.images.slice(0, 3).map((img, i) => (
                                <img 
                                  key={i}
                                  src={img} 
                                  alt={`Place ${index} preview ${i}`}
                                  style={{ 
                                    width: '60px', 
                                    height: '40px', 
                                    objectFit: 'cover', 
                                    margin: '2px',
                                    borderRadius: '4px'
                                  }}
                                />
                              ))}
                              {place.images.length > 3 && (
                                <Chip 
                                  label={`+${place.images.length - 3} more`} 
                                  size="small"
                                  style={{ margin: '2px' }}
                                />
                              )}
                            </>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              No images
                            </Typography>
                          )}
                        </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Grid>

              {/* Right side - Image Preview and Place Details */}
              <Grid item xs={12} md={6} style={{padding:'30px'}}>
                {/* Package Image Preview Section */}
                <Typography variant="h6" gutterBottom style={{ color: '#555' }}>
                  Package Image
                </Typography>
                
                {/* Package Image Preview */}
                <Box
                  style={{
                    width: '100%',
                    height: '250px',
                    border: '1px dashed #ccc',
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                    marginBottom: '20px'
                  }}
                >
                  {packageImage ? (
                    <img
                      src={packageImage}
                      alt="Package Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '10px',
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/600x400?text=Invalid+Image+URL";
                      }}
                    />
                  ) : (
                    <Typography variant="body1" color="textSecondary">
                      {useImageUrl ? 'Enter a valid image URL to see preview' : 'Upload an image to see preview'}
                    </Typography>
                  )}
                </Box>
                
                <FormControl fullWidth margin="normal" variant="outlined" error={!!errors.packageImage}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={toggleImageSource}
                    style={{ marginBottom: '10px' }}
                  >
                    {useImageUrl ? 'Switch to Image Upload' : 'Switch to Image URL'}
                  </Button>
                  
                  {useImageUrl ? (
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Package Image URL"
                      variant="outlined"
                      value={packageImage}
                      onChange={(e) => {
                        setPackageImage(e.target.value);
                        if (errors.packageImage) {
                          setErrors(prevErrors => ({ ...prevErrors, packageImage: '' }));
                        }
                      }}
                      helperText={errors.packageImage}
                      error={!!errors.packageImage}
                      required
                    />
                  ) : (
                    <Box>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="contained-button-file"
                        multiple
                        type="file"
                        onChange={handleImageUpload}
                      />
                      <label htmlFor="contained-button-file">
                        <Button
                          variant="contained"
                          color="primary"
                          component="span"
                          startIcon={<AddPhotoAlternate />}
                          fullWidth
                        >
                          Upload Image
                        </Button>
                      </label>
                      {uploadedImage && (
                        <Typography variant="body2" style={{ marginTop: '8px' }}>
                          File: {uploadedImage.name}
                        </Typography>
                      )}
                      {errors.packageImage && (
                        <FormHelperText error>{errors.packageImage}</FormHelperText>
                      )}
                    </Box>
                  )}
                </FormControl>

                <Divider style={{ margin: '20px 0' }} />

                {/* Place Details Section */}
                <Typography variant="h6" gutterBottom style={{ color: '#555', marginTop: '20px' }}>
                  Add Places to Package
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Place Name"
                      variant="outlined"
                      value={currentPlace.name}
                      onChange={(e) => {
                        setCurrentPlace({ ...currentPlace, name: e.target.value });
                        if (placeErrors.name) {
                          setPlaceErrors(prev => ({ ...prev, name: '' }));
                        }
                      }}
                      error={!!placeErrors.name}
                      helperText={placeErrors.name}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Place Description"
                      variant="outlined"
                      multiline
                      rows={3}
                      value={currentPlace.description}
                      onChange={(e) => {
                        setCurrentPlace({ ...currentPlace, description: e.target.value });
                        if (placeErrors.description) {
                          setPlaceErrors(prev => ({ ...prev, description: '' }));
                        }
                      }}
                      error={!!placeErrors.description}
                      helperText={placeErrors.description}
                      required
                    />
                  </Grid>
                  
                  {/* Place Images */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Place Image URL</Typography>
                    <TextField
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      placeholder="Paste image URL here"
                      value={currentPlace.image}
                      onChange={(e) => {
                        setCurrentPlace({ ...currentPlace, image: e.target.value });
                        if (placeErrors.images) {
                          setPlaceErrors({ ...placeErrors, images: '' });
                        }
                      }}
                      error={!!placeErrors.images}
                      helperText={placeErrors.images}
                    />
                  </Grid>
                  
                  {/* Place Type */}
                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      options={placeTypes}
                      value={currentPlace.placeType}
                      onChange={(event, newValue) => {
                        setCurrentPlace({ ...currentPlace, placeType: newValue });
                        if (placeErrors.placeType) {
                          setPlaceErrors(prev => ({ ...prev, placeType: '' }));
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          label="Place Type"
                          error={!!placeErrors.placeType}
                          helperText={placeErrors.placeType}
                          required
                        />
                      )}
                    />
                  </Grid>
                  
              {/* Location Coordinates */}
              <Grid item xs={12}>
                <Typography variant="subtitle1">Location Coordinates</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Latitude"
                      variant="outlined"
                      type="number"
                      value={currentPlace.location.coordinates[1]} // Latitude is at index 1
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        // Validate latitude between -90 and 90 degrees
                        const validValue = isNaN(value) ? '' : Math.min(Math.max(-90, value), 90);
                        const newCoords = [...currentPlace.location.coordinates];
                        newCoords[1] = validValue;
                        setCurrentPlace({
                          ...currentPlace,
                          location: {
                            ...currentPlace.location,
                            coordinates: newCoords
                          }
                        });
                        // Clear any existing error for latitude
                        if (placeErrors.latitude) {
                          setPlaceErrors(prev => ({ ...prev, latitude: undefined }));
                        }
                        // Also clear the general location error if it exists
                        if (placeErrors.location) {
                          setPlaceErrors(prev => ({ ...prev, location: undefined }));
                        }
                      }}
                      inputProps={{
                        min: -90,
                        max: 90,
                        step: 0.000001
                      }}
                      helperText={placeErrors.latitude || "Range: -90 to 90"}
                      error={!!placeErrors.latitude}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Longitude"
                      variant="outlined"
                      type="number"
                      value={currentPlace.location.coordinates[0]} // Longitude is at index 0
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        // Validate longitude between -180 and 180 degrees
                        const validValue = isNaN(value) ? '' : Math.min(Math.max(-180, value), 180);
                        const newCoords = [...currentPlace.location.coordinates];
                        newCoords[0] = validValue;
                        setCurrentPlace({
                          ...currentPlace,
                          location: {
                            ...currentPlace.location,
                            coordinates: newCoords
                          }
                        });
                        // Clear any existing error for longitude
                        if (placeErrors.longitude) {
                          setPlaceErrors(prev => ({ ...prev, longitude: undefined }));
                        }
                        // Also clear the general location error if it exists
                        if (placeErrors.location) {
                          setPlaceErrors(prev => ({ ...prev, location: undefined }));
                        }
                      }}
                      inputProps={{
                        min: -180,
                        max: 180,
                        step: 0.000001
                      }}
                      helperText={placeErrors.longitude || "Range: -180 to 180"}
                      error={!!placeErrors.longitude}
                    />
                  </Grid>
                </Grid>
                {placeErrors.location && (
                  <FormHelperText error>{placeErrors.location}</FormHelperText>
                )}
              </Grid>
                  
                  {/* Suitable For Section */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Suitable For</Typography>
                    <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                    <Typography variant="body2" style={{marginBottom:'10px'}}>Age Range</Typography>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item xs={5}>
                      <TextField
                        fullWidth
                        label="Min"
                        type="number"
                        variant="outlined"
                        value={currentPlace.suitableFor.ageRange.min}
                        onChange={(e) => {
                          // Remove any '+' or '-' signs from the input value
                          const rawValue = e.target.value.replace(/[+\-]/g, '');
                          const value = parseInt(rawValue);
                          
                          // Validate input between 1 and 100
                          const validValue = isNaN(value) ? '' : Math.min(Math.max(1, value), 100);
                          
                          setCurrentPlace({
                            ...currentPlace,
                            suitableFor: {
                              ...currentPlace.suitableFor,
                              ageRange: {
                                ...currentPlace.suitableFor.ageRange,
                                min: validValue
                              }
                            }
                          });
                        }}
                        // Prevent typing + and - directly
                        onKeyDown={(e) => {
                          if (e.key === '+' || e.key === '-') {
                            e.preventDefault();
                          }
                        }}
                        inputProps={{
                          min: 1,
                          max: 100,
                          step: 1
                        }}
                        onBlur={(e) => {
                          // Additional validation on blur
                          if (e.target.value === '' || parseInt(e.target.value) < 1) {
                            setCurrentPlace({
                              ...currentPlace,
                              suitableFor: {
                                ...currentPlace.suitableFor,
                                ageRange: {
                                  ...currentPlace.suitableFor.ageRange,
                                  min: 1
                                }
                              }
                            });
                          }
                        }}
                      />
                      </Grid>
                      <Grid item xs={2} style={{ textAlign: 'center' }}>
                        <Typography>to</Typography>
                      </Grid>
                      <Grid item xs={5}>
                      <TextField
                        fullWidth
                        label="Max"
                        type="number"
                        variant="outlined"
                        value={currentPlace.suitableFor.ageRange.max}
                        onChange={(e) => {
                          // Remove any '+' or '-' signs from the input value
                          const rawValue = e.target.value.replace(/[+\-]/g, '');
                          const value = parseInt(rawValue);
                          
                          // Validate input between 1 and 100
                          const validValue = isNaN(value) ? '' : Math.min(Math.max(1, value), 100);
                          
                          setCurrentPlace({
                            ...currentPlace,
                            suitableFor: {
                              ...currentPlace.suitableFor,
                              ageRange: {
                                ...currentPlace.suitableFor.ageRange,
                                max: validValue
                              }
                            }
                          });
                        }}
                        // Prevent typing + and - directly
                        onKeyDown={(e) => {
                          if (e.key === '+' || e.key === '-') {
                            e.preventDefault();
                          }
                        }}
                        inputProps={{
                          min: 1,
                          max: 100,
                          step: 1
                        }}
                        onBlur={(e) => {
                          // Additional validation on blur
                          if (e.target.value === '' || parseInt(e.target.value) < 1) {
                            setCurrentPlace({
                              ...currentPlace,
                              suitableFor: {
                                ...currentPlace.suitableFor,
                                ageRange: {
                                  ...currentPlace.suitableFor.ageRange,
                                  max: 100
                                }
                              }
                            });
                          }
                          // Ensure max is not less than min
                          else if (parseInt(e.target.value) < currentPlace.suitableFor.ageRange.min) {
                            setCurrentPlace({
                              ...currentPlace,
                              suitableFor: {
                                ...currentPlace.suitableFor,
                                ageRange: {
                                  ...currentPlace.suitableFor.ageRange,
                                  max: currentPlace.suitableFor.ageRange.min
                                }
                              }
                            });
                          }
                        }}
                      />
                      </Grid>
                    </Grid>
                  </Grid>
                      
                  {/* Hobbies */}
                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      options={hobbies}
                      value={currentPlace.suitableFor.hobbies}
                      onChange={(event, newValue) => {
                        setCurrentPlace({
                          ...currentPlace,
                          suitableFor: {
                            ...currentPlace.suitableFor,
                            hobbies: newValue
                          }
                        });
                        // Clear the error when hobbies are selected
                        if (placeErrors.hobbies && newValue.length > 0) {
                          setPlaceErrors(prev => ({ ...prev, hobbies: '' }));
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          label="Hobbies"
                          error={!!placeErrors.hobbies}
                          helperText={placeErrors.hobbies}
                          required  // Add required prop to show the asterisk
                        />
                      )}
                    />
                  </Grid>
                      
                  {/* Climate */}
                  <Grid item xs={12}>
                    <FormControl fullWidth variant="outlined" error={!!placeErrors.climate}>
                      <InputLabel id="climate-select-label">Climate</InputLabel>
                      <Select
                        labelId="climate-select-label"
                        value={currentPlace.suitableFor.climate}
                        onChange={(e) => {
                          setCurrentPlace({
                            ...currentPlace,
                            suitableFor: {
                              ...currentPlace.suitableFor,
                              climate: e.target.value
                            }
                          });
                          if (placeErrors.climate) {
                            setPlaceErrors(prev => ({ ...prev, climate: '' }));
                          }
                        }}
                        label="Climate"
                        required
                      >
                        {climateTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>{placeErrors.climate}</FormHelperText>
                    </FormControl>
                  </Grid>
                    </Grid>
                  </Grid>
                  
                  {/* Health Considerations */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" style={{marginBottom:'10px'}}>Health Considerations</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Autocomplete
                          multiple
                          options={healthConditions}
                          value={currentPlace.suitableFor.healthConsiderations.notRecommendedFor}
                          onChange={(event, newValue) => {
                            setCurrentPlace({
                              ...currentPlace,
                              suitableFor: {
                                ...currentPlace.suitableFor,
                                healthConsiderations: {
                                  ...currentPlace.suitableFor.healthConsiderations,
                                  notRecommendedFor: newValue
                                }
                              }
                            });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="outlined"
                              label="Not Recommended For"
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Autocomplete
                          multiple
                          options={specialFacilities}
                          value={currentPlace.suitableFor.healthConsiderations.specialFacilities}
                          onChange={(event, newValue) => {
                            setCurrentPlace({
                              ...currentPlace,
                              suitableFor: {
                                ...currentPlace.suitableFor,
                                healthConsiderations: {
                                  ...currentPlace.suitableFor.healthConsiderations,
                                  specialFacilities: newValue
                                }
                              }
                            });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="outlined"
                              label="Special Facilities"
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAddPlace}
                      startIcon={<Add />}
                      fullWidth
                      style={{backgroundColor:'#0096FF'}}
                    >
                      Add Place
                    </Button>
                  </Grid>
                </Grid>
                
                <Divider style={{ margin: '20px 0' }} />
              </Grid>
            </Grid>
            
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              type="submit"
              style={{ marginTop: 24 }}
              disabled={!isFormValid}
            >
              Add Tour Package
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddTourPackage;