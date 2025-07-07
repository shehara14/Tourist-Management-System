//backend/Controller/ControllerPayment.js
const Payment = require("../models/ModelPayment");
const client = require("../whatsappClient");

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

const addPayment = async (req, res, next) => {
    const { cardHolderName, cardNumber, expiryDate, cvv, cardType, cardBrand, amount, date, whatsAppNumber, status } = req.body;

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

        // Send WhatsApp confirmation if payment is completed
        if (status === 'Completed') {
            try {
                // Format WhatsApp number (remove leading 0, add country code like '94' for Sri Lanka)
                const rawNumber = whatsAppNumber || "";
                const formattedNumber = "94" + rawNumber.slice(1) + "@c.us";

                // Create payment confirmation message
                const message = `
💳 *PAYMENT CONFIRMATION* 💳

Dear ${cardHolderName},

Thank you for your payment of $${amount}!

*Payment Details:*
🔹 Card: ${cardBrand} (•••• ${cardNumber.slice(-4)})
🔹 Date: ${new Date(date).toLocaleDateString()}
🔹 Status: Completed ✅

If you have any questions, please contact our support.

Thank you for choosing our service!

Best regards,
*WanderLanka Team*
`;

                // Send WhatsApp message
                await client.sendMessage(formattedNumber, message);
                console.log('WhatsApp confirmation sent successfully');
            } catch (whatsappError) {
                console.error('Error sending WhatsApp confirmation:', whatsappError);
                // Don't fail the payment if WhatsApp fails
            }
        }

        return res.status(200).json({ 
            success: true,
            payment,
            message: status === 'completed' ? 
                   'Payment added and confirmation sent' : 
                   'Payment added successfully'
        });

    } catch (err) {
        console.error('Error adding payment:', err);
        return res.status(500).json({ 
            success: false,
            message: "Error adding payment",
            error: err.message 
        });
    }
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
const sendPaymentConfirmation = async (req, res, next) => {
    const { id } = req.params;
    
    try {
        const payment = await Payment.findById(id);
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        // Format WhatsApp number (remove leading 0, add country code like '94' for Sri Lanka)
        const rawNumber = payment.whatsAppNumber || "";
        const formattedNumber = "94" + rawNumber.slice(1) + "@c.us";

        // Create detailed payment confirmation message
        const message = `
💳 *PAYMENT CONFIRMATION* 💳

Dear ${payment.cardHolderName},

Thank you for your payment!

*PAYMENT DETAILS:*
🆔 Transaction ID: ${payment._id.toString().slice(-6)}
💳 Card: ${payment.cardBrand} (•••• ${payment.cardNumber.slice(-4)})
💰 Amount: $${payment.amount.toFixed(2)}
📅 Date: ${new Date(payment.date).toLocaleDateString()}
📱 WhatsApp: ${payment.whatsAppNumber}

*STATUS:* ${payment.status === 'completed' ? 'Completed ✅' : 
           payment.status === 'pending' ? 'Pending ⏳' : 'Failed ❌'}

If you have any questions about this payment, please contact our support team at (+94) 77 123 4567.

Thank you for your business!

Best regards,
*WanderLanka Payment System*
`;

        // Send WhatsApp message
        await client.sendMessage(formattedNumber, message);

        return res.status(200).json({ 
            success: true, 
            message: "Payment confirmation sent successfully" 
        });

    } catch (err) {
        console.error('Error sending payment confirmation:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Error sending payment confirmation',
            error: err.message 
        });
    }
};

exports.getAllPayment = getAllPayment;
exports.addPayment = addPayment;
exports.getPaymentById = getPaymentById;
exports.updatePayment = updatePayment;
exports.deletePayment = deletePayment;
exports.sendPaymentConfirmation = sendPaymentConfirmation;