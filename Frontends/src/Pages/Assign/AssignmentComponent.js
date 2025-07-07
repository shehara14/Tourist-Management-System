import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, MenuItem, Select, FormControl, InputLabel, Typography 
} from '@mui/material';
import { FaCar, FaUser, FaCalendarAlt, FaLink, FaUnlink } from 'react-icons/fa';
import axios from 'axios';
import './AssignmentComponent.css';

const AssignmentComponent = () => {
  const [assignments, setAssignments] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEndDialog, setOpenEndDialog] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const API_BASE_URL = 'http://localhost:5000/api';
  const [newAssignment, setNewAssignment] = useState({
    driverId: '',
    vehicleId: '',
    startDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

const fetchData = async () => {
  try {
    setLoading(true);
    setError('');
    
    // Fetch active assignments
    const assignmentsRes = await axios.get(`${API_BASE_URL}/assignments/active`);
    setAssignments(assignmentsRes.data.data || []);
    
    // Fetch available drivers - updated endpoint
    const driversRes = await axios.get(`http://localhost:5000/driver/available`);
    setAvailableDrivers(driversRes.data.data || []);
    
    // Fetch available vehicles - updated endpoint
    const vehiclesRes = await axios.get(`http://localhost:5000/vehicle/available`);
    setAvailableVehicles(vehiclesRes.data.data || []);
    
  } catch (err) {
    console.error('Error fetching data:', err);
    setError('Failed to load data. Please try again later.');
  } finally {
    setLoading(false);
  }
};

const handleCreateAssignment = async () => {
  try {
    // Transform data to match backend expectations
    const assignmentData = {
      driver: newAssignment.driverId,  // Changed from driverId to driver
      vehicle: newAssignment.vehicleId, // Changed from vehicleId to vehicle
      startDate: newAssignment.startDate,
      notes: newAssignment.notes
    };

    const response = await axios.post(`${API_BASE_URL}/assignments`, assignmentData);
    
    if (response.data.success) {
      setOpenCreateDialog(false);
      setNewAssignment({
        driverId: '',
        vehicleId: '',
        startDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      fetchData(); // Refresh data
    }
  } catch (err) {
    console.error('Error creating assignment:', err);
  }
};

const handleEndAssignment = async () => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/assignments/${currentAssignment._id}/end`,
      { endDate: new Date().toISOString() }
    );
    
    if (response.data.success) {
      setOpenEndDialog(false);
      setCurrentAssignment(null);
      fetchData(); // Refresh data
    }
  } catch (err) {
    console.error('Error ending assignment:', err);
    setError('Failed to end assignment. ' + (err.response?.data?.message || ''));
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAssignment(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <div className="loading-message">Loading assignments...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="assignment-container">
      <Typography variant="h4" gutterBottom>
        Driver-Vehicle Assignments
      </Typography>

      <div className="assignment-actions">
        <Button
          variant="contained"
          color="primary"
          startIcon={<FaLink />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Create New Assignment
        </Button>
      </div>

      <TableContainer component={Paper} className="assignment-table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Driver</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <TableRow key={assignment._id}>
                  <TableCell>
                    <div className="driver-info">
                      <FaUser className="icon" />
                      <span>{assignment.driver?.name || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="vehicle-info">
                      <FaCar className="icon" />
                      <span>
                        {assignment.vehicle?.vehicleModel || 'N/A'} ({assignment.vehicle?.vehicleNumber || 'N/A'})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(assignment.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span className={`status-badge ${assignment.isActive ? 'active' : 'inactive'}`}>
                      {assignment.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {assignment.isActive && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<FaUnlink />}
                        onClick={() => {
                          setCurrentAssignment(assignment);
                          setOpenEndDialog(true);
                        }}
                      >
                        End Assignment
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No active assignments found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Assignment Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Assignment</DialogTitle>
        <DialogContent>
          <div className="form-group">
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Driver</InputLabel>
              <Select
                name="driverId"
                value={newAssignment.driverId}
                onChange={handleInputChange}
                required
              >
                {availableDrivers.map((driver) => (
                  <MenuItem key={driver._id} value={driver._id}>
                    {driver.name} ({driver.licenseNumber})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="form-group">
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Vehicle</InputLabel>
              <Select
                name="vehicleId"
                value={newAssignment.vehicleId}
                onChange={handleInputChange}
                required
              >
                {availableVehicles.map((vehicle) => (
                  <MenuItem key={vehicle._id} value={vehicle._id}>
                    {vehicle.vehicleModel} ({vehicle.vehicleNumber})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="form-group">
            <TextField
              fullWidth
              margin="normal"
              type="date"
              name="startDate"
              label="Start Date"
              value={newAssignment.startDate}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </div>

          <div className="form-group">
            <TextField
              fullWidth
              margin="normal"
              name="notes"
              label="Notes"
              value={newAssignment.notes}
              onChange={handleInputChange}
              multiline
              rows={3}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateAssignment} 
            color="primary"
            disabled={!newAssignment.driverId || !newAssignment.vehicleId}
          >
            Create Assignment
          </Button>
        </DialogActions>
      </Dialog>

      {/* End Assignment Dialog */}
      <Dialog open={openEndDialog} onClose={() => setOpenEndDialog(false)}>
        <DialogTitle>End Assignment</DialogTitle>
        <DialogContent>
          <p>
            Are you sure you want to end the assignment between{' '}
            <strong>{currentAssignment?.driver?.name}</strong> and{' '}
            <strong>{currentAssignment?.vehicle?.vehicleModel}</strong>?
          </p>
          <p>This will make both the driver and vehicle available for new assignments.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEndDialog(false)}>Cancel</Button>
          <Button onClick={handleEndAssignment} color="secondary">
            Confirm End Assignment
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AssignmentComponent;