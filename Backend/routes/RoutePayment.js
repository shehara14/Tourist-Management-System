//backend/Route/RoutePayment.js
const express = require("express");
const router = express.Router();
//insert model
const payment = require("../models/ModelPayment");
//insert payment controller
const paymentController = require("../controllers/ControllerPayment");

router.get("/", paymentController.getAllPayment);
router.post("/", paymentController.addPayment);
router.get("/:id", paymentController.getPaymentById);
router.put("/:id", paymentController.updatePayment);
router.delete("/:id", paymentController.deletePayment);

//export
module.exports = router;