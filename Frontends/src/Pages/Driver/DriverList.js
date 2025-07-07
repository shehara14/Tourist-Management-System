import React, { useState, useEffect } from 'react';
import './Driver.css';
import Swal from 'sweetalert2';

function DriverList() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/drivers/all');
      const data = await response.json();
      if (response.ok) {
        setDrivers(data);
      } else {
        setError(data.message || 'Error fetching drivers');
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
        const response = await fetch(`http://localhost:5000/driver/delete/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          Swal.fire(
            'Deleted!',
            'Driver has been deleted.',
            'success'
          );
          fetchDrivers(); // Refresh the list
        } else {
          const data = await response.json();
          throw new Error(data.message || 'Error deleting driver');
        }
      }
    } catch (error) {
      Swal.fire(
        'Error!',
        error.message || 'An error occurred while deleting the driver',
        'error'
      );
    }
  };

  if (loading) {
    return <div className="driver-loading">Loading...</div>;
  }

  if (error) {
    return <div className="driver-error-message">{error}</div>;
  }

  return (
    <div className="driver-list-container">
      <h2 className="driver-list-title">Driver List</h2>
      
      <div className="driver-table-container">
        <table className="driver-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>License Category</th>
              <th>Languages</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver._id}>
                <td>{driver.name}</td>
                <td>{driver.phone}</td>
                <td>{driver.email}</td>
                <td>{driver.licenseCategory}</td>
                <td>{driver.languages}</td>
                <td>
                  <button
                    className="driver-action-btn view"
                    onClick={() => window.location.href = `/driver/${driver._id}`}
                  >
                    View
                  </button>
                  <button
                    className="driver-action-btn edit"
                    onClick={() => window.location.href = `/driver/edit/${driver._id}`}
                  >
                    Edit
                  </button>
                  <button
                    className="driver-action-btn delete"
                    onClick={() => handleDelete(driver._id)}
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

export default DriverList; 