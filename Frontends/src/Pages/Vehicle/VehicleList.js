import React, { useState, useEffect } from 'react';
import './Vehicle.css';
import Swal from 'sweetalert2';

function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('http://localhost:5000/vehicle/all');
      const data = await response.json();
      if (response.ok) {
        setVehicles(data);
      } else {
        setError(data.message || 'Error fetching vehicles');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        const response = await fetch(`http://localhost:5000/vehicle/delete/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          Swal.fire(
            'Deleted!',
            'Vehicle has been deleted.',
            'success'
          );
          fetchVehicles(); // Refresh the list
        } else {
          const data = await response.json();
          throw new Error(data.message || 'Error deleting vehicle');
        }
      }
    } catch (error) {
      Swal.fire(
        'Error!',
        error.message || 'An error occurred while deleting the vehicle',
        'error'
      );
    }
  };

  if (loading) {
    return <div className="vehicle-loading">Loading...</div>;
  }

  if (error) {
    return <div className="vehicle-error-message">{error}</div>;
  }

  return (
    <div className="vehicle-list-container">
      <h2 className="vehicle-list-title">Vehicle List</h2>
      
      <div className="vehicle-table-container">
        <table className="vehicle-table">
          <thead>
            <tr>
              <th>Vehicle Number</th>
              <th>Type</th>
              <th>Model</th>
              <th>Brand</th>
              <th>Capacity</th>
              <th>Price/Day</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle._id}>
                <td>{vehicle.vehicleNumber}</td>
                <td>{vehicle.vehicleType}</td>
                <td>{vehicle.vehicleModel}</td>
                <td>{vehicle.vehicleBrand}</td>
                <td>{vehicle.vehicleCapacity}</td>
                <td>${vehicle.vehiclePrice}</td>
                <td>
                  <span className={`status-badge ${vehicle.vehicleStatus.toLowerCase().replace(' ', '-')}`}>
                    {vehicle.vehicleStatus}
                  </span>
                </td>
                <td>
                  <button
                    className="vehicle-action-btn view"
                    onClick={() => window.location.href = `/vehicle/${vehicle._id}`}
                  >
                    View
                  </button>
                  <button
                    className="vehicle-action-btn edit"
                    onClick={() => window.location.href = `/vehicle/edit/${vehicle._id}`}
                  >
                    Edit
                  </button>
                  <button
                    className="vehicle-action-btn delete"
                    onClick={() => handleDelete(vehicle._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VehicleList; 