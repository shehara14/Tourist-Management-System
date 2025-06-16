//backend/Model/ModelPayment.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
    cardHolderName:{
        type: String,
        required: true
    },

    cardNumber: {
        type: String,
        required: true
    },

    expiryDate: {
        type: String,
        required: true
    },

    cvv: {
        type: String,
        required: true
    },

    cardType: {
        type: String,
        required: true
    },

    cardBrand: {
        type: String,
        required: true
    },

    amount: {
        type: String,
        required: true
    },

    date: {
        type: Date,
        default: Date.now
    },

    whatsAppNumber: {
        type: String,
        required: true
    },

    status: {
        type: String,
        required: true
    }
});
    
module.exports = mongoose.model(
    "Payment", 
    PaymentSchema
);