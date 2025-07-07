import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Payment.css';

function Payment() {
    const [formData, setFormData] = useState({
        cardHolderName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardType: 'Credit',
        cardBrand: 'Visa',
        amount: '',
        date: '',
        whatsAppNumber: '',
        status: 'Completed', // Default status set to Completed
    });

    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setFormData((prevState) => ({
            ...prevState,
            date: today,
        }));
    }, []);

    const formatCardNumber = (value) => {
        const numbers = value.replace(/\s/g, '');
        const groups = [];
        for (let i = 0; i < numbers.length && i < 16; i += 4) {
            groups.push(numbers.slice(i, i + 4));
        }
        return groups.join(' ');
    };

    const validateCardHolderName = (value) => value === '' || /^[a-zA-Z\s]+$/.test(value);
    
    const validateCardNumber = (value) => {
        const digitsOnly = value.replace(/\s/g, '');
        return /^[0-9]{0,16}$/.test(digitsOnly);
    };
    
    const validateCVV = (value) => /^[0-9]{0,3}$/.test(value);
    
    const validatePhone = (value) => /^[0-9]{0,10}$/.test(value);
    
    const validateExpiryDate = (value) => {
        if (!value || value.length !== 5) return false;
        
        const [month, year] = value.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100; // Get last two digits of year
        const currentMonth = currentDate.getMonth() + 1; // getMonth() is 0-indexed
        
        const enteredMonth = parseInt(month, 10);
        const enteredYear = parseInt(year, 10);
        
        // Check if month is valid (1-12)
        if (enteredMonth < 1 || enteredMonth > 12) return false;
        
        // Check if date is in the past
        if (enteredYear < currentYear || (enteredYear === currentYear && enteredMonth < currentMonth)) {
            return false;
        }
        
        return true;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let updatedErrors = { ...errors };

        if (name === 'cardHolderName') {
            if (!validateCardHolderName(value)) return;
            updatedErrors.cardHolderName = value ? '' : 'Card holder name is required';
        }
        
        if (name === 'cardNumber') {
            const digitsOnly = value.replace(/\s/g, '');
            if (!validateCardNumber(digitsOnly)) return;
            
            const formatted = formatCardNumber(digitsOnly);
            setFormData({ ...formData, [name]: formatted });
            updatedErrors.cardNumber = digitsOnly.length === 16 ? '' : 'Card number must be 16 digits';
            setErrors(updatedErrors);
            return;
        }
        
        if (name === 'expiryDate') {
            let formatted = value.replace(/[^0-9]/g, '');
            if (formatted.length > 4) return;
            
            if (formatted.length > 2) {
                formatted = `${formatted.slice(0, 2)}/${formatted.slice(2, 4)}`;
            }
            
            setFormData({ ...formData, [name]: formatted });
            
            if (formatted.length === 5) {
                updatedErrors.expiryDate = validateExpiryDate(formatted) ? '' : 'Card is expired';
            } else {
                updatedErrors.expiryDate = '';
            }
            
            setErrors(updatedErrors);
            return;
        }
        
        if (name === 'cvv') {
            if (!validateCVV(value)) return;
            updatedErrors.cvv = value.length === 3 ? '' : 'CVV must be 3 digits';
        }
        
        if (name === 'whatsAppNumber') {
            if (!validatePhone(value)) return;
            updatedErrors.whatsAppNumber = value.length === 10 ? '' : 'Phone number must be 10 digits';
        }
        
        if (name === 'amount') {
            const numValue = parseFloat(value);
            if (numValue > 1000000) {
                updatedErrors.amount = 'Amount cannot exceed 1,000,000';
            } else if (numValue <= 0) {
                updatedErrors.amount = 'Amount must be greater than 0';
            } else {
                updatedErrors.amount = '';
            }
        }

        setFormData({ ...formData, [name]: value });
        setErrors(updatedErrors);
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.cardHolderName) {
            newErrors.cardHolderName = 'Card holder name is required';
        }
        
        if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
            newErrors.cardNumber = 'Card number must be 16 digits';
        }
        
        if (!validateExpiryDate(formData.expiryDate)) {
            newErrors.expiryDate = 'Invalid or expired date';
        }
        
        if (formData.cvv.length !== 3) {
            newErrors.cvv = 'CVV must be 3 digits';
        }
        
        if (formData.whatsAppNumber.length !== 10) {
            newErrors.whatsAppNumber = 'Phone number must be 10 digits';
        }
        
        const amount = parseFloat(formData.amount);
        if (!formData.amount) {
            newErrors.amount = 'Amount is required';
        } else if (amount <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        } else if (amount > 1000000) {
            newErrors.amount = 'Amount cannot exceed 1,000,000';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        try {
            // First save the payment
            await axios.post("http://localhost:5000/payment", formData);
            
            setSuccess(true);
            setTimeout(() => {
                navigate('/default-package');
            }, 3000);
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('There was an error processing your payment. Please try again.');
        }
    };

    return (
        <div className="payment-wrapper">
            <div className="payment-container">
                {success ? (
                    <div className="success-container">
                        <div className="checkmark-circle">
                            <div className="checkmark draw"></div>
                        </div>
                        <h2 className="success-message">Payment Successful!</h2>
                        <p>Redirecting to your payment details...</p>
                    </div>
                ) : (
                    <>
                        <div className="payment-header">
                            <h1>Payment Details</h1>
                            <p>Please enter your card information to complete the payment</p>
                        </div>
                        <form onSubmit={handleSubmit} className="payment-form">
                            <div className="form-group">
                                <label>Card Holder Name</label>
                                <input 
                                    type="text" 
                                    name="cardHolderName" 
                                    value={formData.cardHolderName} 
                                    onChange={handleChange} 
                                    required 
                                    placeholder="John Smith" 
                                    className={errors.cardHolderName ? 'error' : ''}
                                />
                                {errors.cardHolderName && <span className="error-message">{errors.cardHolderName}</span>}
                            </div>

                            <div className="form-group">
                                <label>Card Number</label>
                                <input 
                                    type="text" 
                                    name="cardNumber" 
                                    value={formData.cardNumber} 
                                    onChange={handleChange} 
                                    required 
                                    placeholder="1234 5678 9012 3456" 
                                    className={errors.cardNumber ? 'error' : ''}
                                    maxLength={19}
                                />
                                {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Expiry Date (MM/YY)</label>
                                    <input 
                                        type="text" 
                                        name="expiryDate" 
                                        value={formData.expiryDate} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="MM/YY" 
                                        className={errors.expiryDate ? 'error' : ''}
                                        maxLength={5}
                                    />
                                    {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
                                </div>

                                <div className="form-group half">
                                    <label>CVV</label>
                                    <input 
                                        type="text" 
                                        name="cvv" 
                                        value={formData.cvv} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="123" 
                                        className={errors.cvv ? 'error' : ''}
                                        maxLength={3}
                                    />
                                    {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Card Type</label>
                                    <select name="cardType" value={formData.cardType} onChange={handleChange}>
                                        <option value="Credit">Credit</option>
                                        <option value="Debit">Debit</option>
                                    </select>
                                </div>

                                <div className="form-group half">
                                    <label>Card Brand</label>
                                    <select name="cardBrand" value={formData.cardBrand} onChange={handleChange}>
                                        <option value="Visa">Visa</option>
                                        <option value="Master">Master</option>
                                        <option value="Amex">Amex</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Amount</label>
                                <input 
                                type="number" 
                                name="amount" 
                                value={formData.amount} 
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // If value is empty or non-numeric, allow it (or handle as you prefer)
                                    if (value === '') {
                                        handleChange(e);
                                        return;
                                    }
                                    
                                    const numValue = Number(value);
                                    // If value exceeds max, set to max
                                    if (numValue > 1000000) {
                                        e.target.value = 1000000;
                                        handleChange(e);
                                    } else {
                                        handleChange(e);
                                    }
                                }} 
                                required 
                                placeholder="Enter Amount (max 1,000,000)" 
                                min="1"
                                max="1000000"
                                onKeyDown={(e) => {
                                    // Prevent typing the minus sign
                                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                        e.preventDefault();
                                    }
                                }}
                            />
                                {errors.amount && <span className="error-message">{errors.amount}</span>}
                            </div>

                            <div className="form-group">
                                <label>WhatsApp Number</label>
                                <input 
                                    type="text" 
                                    name="whatsAppNumber" 
                                    value={formData.whatsAppNumber} 
                                    onChange={handleChange} 
                                    required 
                                    placeholder="10-digit number" 
                                    className={errors.whatsAppNumber ? 'error' : ''}
                                    maxLength={10}
                                />
                                {errors.whatsAppNumber && <span className="error-message">{errors.whatsAppNumber}</span>}
                            </div>

                            {/* Status field is hidden as requested */}
                            <input type="hidden" name="status" value={formData.status} />

                            <button type="submit" className="payment-button">Process Payment</button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

export default Payment;