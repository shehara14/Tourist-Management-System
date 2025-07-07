import React, { useEffect, useState } from 'react';
import { 
  Container,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Button,
  TextField,
  InputAdornment,
  Paper
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import axios from 'axios';
import PackageCard from '../../Components/PackageCard';
import Header from '../../Components/guest_header';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(8, 0),
  },
  title: {
    position: 'relative',
    marginBottom: theme.spacing(4),
    fontWeight: 'bold',
    '&::after': {
      content: '""',
      display: 'block',
      width: 80,
      height: 4,
      backgroundColor: theme.palette.primary.main,
      margin: theme.spacing(2, 'auto', 0),
    }
  },
  subtitle: {
    maxWidth: 800,
    margin: '0 auto 40px',
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3),
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
    borderRadius: theme.spacing(1),
  },
  searchField: {
    marginBottom: theme.spacing(2),
  },
  noResults: {
    textAlign: 'center',
    padding: theme.spacing(4),
  }
}));

const AllPackages = () => {
  const classes = useStyles();
  const [allPackages, setAllPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [packageNameSearch, setPackageNameSearch] = useState('');
  const [placeSearch, setPlaceSearch] = useState('');

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/packages');
        setAllPackages(response.data);
        setFilteredPackages(response.data);
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  useEffect(() => {
    filterPackages();
  }, [packageNameSearch, placeSearch, allPackages]);

  const filterPackages = () => {
    const filtered = allPackages.filter((pkg) => {
      const nameMatch = pkg.name.toLowerCase().includes(packageNameSearch.toLowerCase());
      
      let placeMatch = true;
      if (placeSearch) {
        placeMatch = pkg.places.some(place => 
          place.name.toLowerCase().includes(placeSearch.toLowerCase())
        );
      }
      
      return nameMatch && placeMatch;
    });
    
    setFilteredPackages(filtered);
  };

  const handlePackageNameSearch = (e) => {
    setPackageNameSearch(e.target.value);
  };

  const handlePlaceSearch = (e) => {
    setPlaceSearch(e.target.value);
  };

  const clearSearch = () => {
    setPackageNameSearch('');
    setPlaceSearch('');
  };

  if (loading) {
    return (
      <Container className={classes.root}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <div>
      <Container className={classes.root}>
        <Typography variant="h3" align="center" className={classes.title}>
          Our Tour Packages For You
        </Typography>
        <Typography variant="h6" align="center" color="textSecondary" className={classes.subtitle}>
          Discover our curated collection of travel packages tailored to your preferences
        </Typography>
        
        {/* Search Section */}
        <Paper className={classes.searchContainer}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <TextField
                className={classes.searchField}
                fullWidth
                variant="outlined"
                label="Search by Package Name"
                value={packageNameSearch}
                onChange={handlePackageNameSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                className={classes.searchField}
                fullWidth
                variant="outlined"
                label="Search by Place"
                value={placeSearch}
                onChange={handlePlaceSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Box display="flex" height="100%" alignItems="center" justifyContent="center">
                <Button 
                  variant="contained" 
                  color="secondary" 
                  onClick={clearSearch} 
                  fullWidth
                  style={{ height: '56px', marginBottom:'18px' }}
                >
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Results Section */}
        {filteredPackages.length > 0 ? (
          <Grid container spacing={4}>
            {filteredPackages.map(pkg => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={pkg._id}>
                <PackageCard packageData={pkg} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper className={classes.noResults}>
            <Typography variant="h6">
              No packages found matching your search criteria.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={clearSearch}
              style={{ marginTop: '16px' }}
            >
              Clear Search
            </Button>
          </Paper>
        )}
      </Container>
    </div>
  );
};

export default AllPackages;