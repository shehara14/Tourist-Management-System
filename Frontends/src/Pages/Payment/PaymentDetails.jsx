import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import './PaymentDetails.css';

const API_URL = 'http://localhost:5000/payment';

function PaymentDetails() {
  const [payments, setPayments] = useState([]);
  const [editing, setEditing] = useState(null);
  const [updatedData, setUpdatedData] = useState({});
  const [search, setSearch] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL);
      setPayments(response.data.payment || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (payment) => {
    setEditing(payment._id);
    setUpdatedData({
      cardBrand: payment.cardBrand,
      whatsAppNumber: payment.whatsAppNumber,
      amount: payment.amount,
      status: payment.status
    });
    setErrors({});
  };

  const validateField = (name, value) => {
    let error = '';
    
    if (name === 'whatsAppNumber') {
      if (!value) {
        error = 'WhatsApp number is required';
      } else if (!/^\d+$/.test(value)) {
        error = 'Only numbers allowed';
      } else if (value.length > 10) {
        error = 'Maximum 10 digits allowed';
      }
    } else if (name === 'amount') {
      if (!value) {
        error = 'Amount is required';
      } else if (isNaN(value)) {
        error = 'Must be a number';
      } else if (value > 10000000) {
        error = 'Maximum amount is 10,000,000';
      } else if (value <= 0) {
        error = 'Amount must be positive';
      }
    } else if (name === 'cardBrand' || name === 'status') {
      if (!value) {
        error = 'This field is required';
      }
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validate the field
    const error = validateField(name, value);
    setErrors({
      ...errors,
      [name]: error
    });
    
    // Update the data if no error or if we're clearing an error
    if (!error || (updatedData[name] && !value)) {
      setUpdatedData({ 
        ...updatedData, 
        [name]: name === 'amount' ? parseFloat(value) || '' : value 
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    // Check all required fields
    ['cardBrand', 'whatsAppNumber', 'amount', 'status'].forEach(field => {
      const error = validateField(field, updatedData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  const handleUpdate = async (id) => {
    if (!validateForm()) {
      return;
    }
    
    try {
      await axios.put(`${API_URL}/${id}`, updatedData);
      setEditing(null);
      fetchPayments();
    } catch (error) {
      console.error('Error updating payment:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchPayments();
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 2000);
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
    setShowConfirm(false);
    setDeleteId(null);
  };

  const downloadPDF = (payment) => {
    const doc = new jsPDF();

    // Draw header bar (dark blue)
    doc.setFillColor(28, 18, 61);
    doc.rect(0, 0, 210, 30, 'F');

    // Add heading (white, bold, large)
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Details', 15, 20);

    // Add contact info (white, right-aligned)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('wanderlanka.lk', 150, 12);
    doc.text('0112479237', 150, 18);
    doc.text('wanderlanka@gmail.com', 150, 24);

    // Payment details section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    let y = 40;
    const fields = [
      ['Name', payment.cardHolderName],
      ['Card Type', payment.cardType],
      ['Card Brand', payment.cardBrand],
      ['Amount', `$${payment.amount}`],
      ['Date', payment.date],
      ['WhatsApp Number', payment.whatsAppNumber],
      ['Status', payment.status],
    ];
    
    fields.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`, 20, y);
      y += 10;
    });

    doc.save(`Payment_${payment._id}.pdf`);
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'status-badge status-completed';
      case 'pending': return 'status-badge status-pending';
      case 'failed': return 'status-badge status-failed';
      default: return 'status-badge';
    }
  };

  const filteredPayments = payments.filter(payment => {
    // Apply search filter
    const matchesSearch = search.toLowerCase() === '' || 
      payment.cardHolderName?.toLowerCase().includes(search.toLowerCase()) ||
      payment.cardNumber?.includes(search) ||
      payment.whatsAppNumber?.includes(search) ||
      payment.status?.toLowerCase().includes(search.toLowerCase());
    
    // Apply status filter
    const matchesStatus = filter === 'all' || 
      payment.status?.toLowerCase() === filter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const isUpdateDisabled = () => {
    return !updatedData.cardBrand || 
           !updatedData.whatsAppNumber || 
           !updatedData.amount || 
           !updatedData.status ||
           Object.values(errors).some(error => error);
  };

  return (
    <div className="payment-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Payment Management</h1>
          <p>View and manage all payment transactions</p>
        </div>
        
        <div className="header-controls">
          <div className="search-container">
            <div className="search-wrapper">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Search payments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
            <button className="refresh-btn" onClick={fetchPayments}>
              <i className="fas fa-sync-alt"></i> Refresh
            </button>
          </div>

          <div className="filter-container">
            <label>Filter by status:</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Payments</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {deleteSuccess && (
          <div className="alert alert-success">
            <i className="fas fa-check-circle"></i> Payment deleted successfully!
          </div>
        )}

        {showConfirm && (
          <div className="confirmation-modal">
            <div className="modal-overlay" onClick={() => setShowConfirm(false)}></div>
            <div className="modal-content">
              <div className="modal-header">
                <h3>Confirm Deletion</h3>
                <button className="modal-close" onClick={() => setShowConfirm(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this payment record? This action cannot be undone.</p>
              </div>
              <div className="modal-actions">
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleDelete(deleteId)}
                >
                  <i className="fas fa-trash"></i> Delete
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading payments...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-wallet"></i>
            <h3>No Payments Found</h3>
            <p>There are no payment records matching your criteria</p>
            <button className="btn btn-primary" onClick={() => { setSearch(''); setFilter('all'); }}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="payments-table-container">
            <div className="table-responsive">
              <table className="payments-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Payment Method</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment._id}>
                      {editing === payment._id ? (
                        <td colSpan="7" className="edit-form">
                          <div className="edit-container">
                            <h4>Edit Payment Details</h4>
                            <div className="form-row">
                              <div className="form-group">
                                <label>Card Brand:</label>
                                <select
                                  name="cardBrand"
                                  value={updatedData.cardBrand || ''}
                                  onChange={handleChange}
                                  className={errors.cardBrand ? 'error' : ''}
                                >
                                  <option value="">Select card brand</option>
                                  <option value="Visa">Visa</option>
                                  <option value="Mastercard">Mastercard</option>
                                  <option value="American Express">American Express</option>
                                  <option value="Discover">Discover</option>
                                </select>
                                {errors.cardBrand && <div className="error-message">{errors.cardBrand}</div>}
                              </div>
                              <div className="form-group">
                                <label>WhatsApp Number:</label>
                                <input
                                  type="text"
                                  name="whatsAppNumber"
                                  value={updatedData.whatsAppNumber || ''}
                                  onChange={handleChange}
                                  placeholder="+94XXXXXXXXX"
                                  maxLength="10"
                                  className={errors.whatsAppNumber ? 'error' : ''}
                                />
                                {errors.whatsAppNumber && <div className="error-message">{errors.whatsAppNumber}</div>}
                              </div>
                            </div>
                            <div className="form-row">
                              <div className="form-group">
                                <label>Amount ($):</label>
                                <input
                                  type="number"
                                  name="amount"
                                  value={updatedData.amount || ''}
                                  onChange={handleChange}
                                  min="0"
                                  max="10000000"
                                  step="0.01"
                                  className={errors.amount ? 'error' : ''}
                                />
                                {errors.amount && <div className="error-message">{errors.amount}</div>}
                              </div>
                              <div className="form-group">
                                <label>Status:</label>
                                <select
                                  name="status"
                                  value={updatedData.status || ''}
                                  onChange={handleChange}
                                  className={errors.status ? 'error' : ''}
                                >
                                  <option value="">Select status</option>
                                  <option value="Pending">Pending</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Failed">Failed</option>
                                </select>
                                {errors.status && <div className="error-message">{errors.status}</div>}
                              </div>
                            </div>
                            <div className="edit-actions">
                              <button
                                className="btn btn-primary"
                                onClick={() => handleUpdate(payment._id)}
                                disabled={isUpdateDisabled()}
                              >
                                <i className="fas fa-save"></i> Save Changes
                              </button>
                              <button
                                className="btn btn-secondary"
                                onClick={() => setEditing(null)}
                              >
                                <i className="fas fa-times"></i> Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td>
                            <div className="customer-info">
                              <div className="customer-name">{payment.cardHolderName}</div>
                              <div className="customer-id">ID: {payment._id.slice(-6)}</div>
                            </div>
                          </td>
                          <td>
                            <div className="payment-method">
                              <div className={`card-brand ${payment.cardBrand?.toLowerCase().replace(' ', '-')}`}>
                                {payment.cardBrand}
                              </div>
                              <div className="card-number">
                                •••• •••• •••• {payment.cardNumber?.slice(-4)}
                              </div>
                            </div>
                          </td>
                          <td className="amount">
                            <div className="amount-value">${parseFloat(payment.amount).toFixed(2)}</div>
                            <div className="amount-label">Payment</div>
                          </td>
                          <td>
                            <div className="payment-date">
                              {new Date(payment.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                              <div className="time">
                                {new Date(payment.date).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="contact-info">
                              <i className="fab fa-whatsapp"></i>
                              {payment.whatsAppNumber}
                            </div>
                          </td>
                          <td>
                            <span className={getStatusBadgeClass(payment.status)}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="actions">
                            <div className="action-buttons">
                              <button
                                className="action-btn edit"
                                onClick={() => handleEdit(payment)}
                                title="Edit"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="action-btn delete"
                                onClick={() => {
                                  setShowConfirm(true);
                                  setDeleteId(payment._id);
                                }}
                                title="Delete"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                              <button
                                className="action-btn download"
                                onClick={() => downloadPDF(payment)}
                                title="Download PDF"
                              >
                                <i className="fas fa-download"></i>
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <div className="summary">
                Showing {filteredPayments.length} of {payments.length} payments
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentDetails;