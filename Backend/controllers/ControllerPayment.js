//backend/Controller/ControllerPayment.js
const Payment = require("../models/ModelPayment");

const getAllPayment = async (req, res, next) => {
    
    let payment;
    try {
        payment = await Payment.find();
    } catch (err) {
        console.log(err);
    }

    //not found
    if (!payment) {
        return res.status(404).json({message: "No payment found"});
    }
    //Display
    return res.status(200).json({payment});
};

//data insert
const addPayment = async (req, res, next) => {

    const { cardHolderName, cardNumber, expiryDate, cvv, cardType, cardBrand, amount, date, whatsAppNumber, status} = req.body;

    let payment;
    try {
        payment = new Payment({
            cardHolderName,
            cardNumber,
            expiryDate,
            cvv,
            cardType,
            cardBrand,
            amount,
            date,
            whatsAppNumber,
            status
        });
        await payment.save();
    } catch (err) {
        console.log(err);
    }
    //not found
    if (!payment) {
        return res.status(404).json({message: "No payment found"});
    }
    //Display
    return res.status(200).json({payment});
};

//Get by id

const getPaymentById = async (req, res, next) => {

    const id = req.params.id;

    let payment;

    try {
        payment = await Payment.findById(id);
    } catch (err) {
        console.log(err);
    }
    //not found
    if (!payment) {
        return res.status(404).json({message: "No payment found"});
    }
    //Display
    return res.status(200).json({payment});
};

//Update payment

const updatePayment = async (req, res, next) => {

    const id = req.params.id;

    const { cardHolderName, cardNumber, expiryDate, cvv, cardType, cardBrand, amount, date, whatsAppNumber, status} = req.body;

    let payment;

    try {
        payment = await Payment.findByIdAndUpdate(id, {
            cardHolderName,
            cardNumber,
            expiryDate,
            cvv,
            cardType,
            cardBrand,
            amount,
            date,
            whatsAppNumber,
            status
        });
        await payment.save();
    } catch (err) {
        console.log(err);
    }
    //not found
    if (!payment) {
        return res.status(404).json({message: "No payment found"});
    }
    //Display
    return res.status(200).json({payment});
};

//Delete payment

const deletePayment = async (req, res, next) => {

    const id = req.params.id;

    let payment;

    try {
        payment = await Payment.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
    }
    //not found
    if (!payment) {
        return res.status(404).json({message: "No payment found"});
    }
    //Display
    return res.status(200).json({payment});
};

// Send WhatsApp message
const sendWhatsAppMessage = async (req, res, next) => {
    const { whatsAppNumber, cardHolderName, amount } = req.body;
    
    try {
        // Format the phone number to include country code if not present
        const formattedNumber = whatsAppNumber.startsWith('+') ? whatsAppNumber : `+94${whatsAppNumber}`;
        
        // Create the message
        const message = `Dear ${cardHolderName},\n\nYour payment of ${amount} has been successfully processed.\n\nThank you for your business!\n\nBest regards,\nPayment System`;

        // Here you would integrate with a WhatsApp API service
        // For example, using Twilio:
        // const client = require('twilio')(accountSid, authToken);
        // await client.messages.create({
        //     body: message,
        //     from: 'whatsapp:+14155238886', // Your Twilio WhatsApp number
        //     to: `whatsapp:${formattedNumber}`
        // });

        // For now, we'll just log the message
        console.log('WhatsApp message to be sent:', {
            to: formattedNumber,
            message: message
        });

        return res.status(200).json({ message: 'WhatsApp message sent successfully' });
    } catch (err) {
        console.error('Error sending WhatsApp message:', err);
        return res.status(500).json({ message: 'Error sending WhatsApp message' });
    }
};

exports.getAllPayment = getAllPayment;
exports.addPayment = addPayment;
exports.getPaymentById = getPaymentById;
exports.updatePayment = updatePayment;
exports.deletePayment = deletePayment;
exports.sendWhatsAppMessage = sendWhatsAppMessage;