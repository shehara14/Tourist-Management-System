const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const defaultPackageSchema = new Schema({

    fullName : {
        type : String,
        required : true //validation
    },

    email : {
        type : String,
        required : true
    },
    
    contactNumber : {
        type : Number,
        required : true
    },

    packageName : {
        type : String,
        required : true
    },

    numberOfTravelers : {
        type : String,
        required : true
    },

    departureDate : {
        type : Date,
        required : true
    },
    
   returnDate : {
        type : Date,
        required : true
    },
    
    preferredTime: {
        type: String,
        required: true
    },
    
    vehicle: {
        type : String,
        required : true
    },

    vehicleType: {
        type : String,
        required : true
    },                                  

    pickupLocation: {
        type : String,
        required : true
    },

    dropOffLocation: {
        type : String
    },

    luggageDetails: {
        type : String
    },

    childSeat: {
        type : String                                
    },

    driverLanguage: {
        type : String,
        required : true
    },

    specialRequest : {
        type : String
    }
})


const defaultPackage = mongoose.model("defaultPackage", defaultPackageSchema);

module.exports = defaultPackage;