const express = require("express");
const router = express.Router();

//Insert Model 
const DefaultPackage = require("../Models/Default_Package_Model");

//Insert Controller
const DefaultPackageController = require("../Controllers/Default_Package_Controller");

// Routes
router.post("/create", DefaultPackageController.addDefaultPackage);
router.get("/allPackages", DefaultPackageController.getAllDefaultPackage);
router.get("/package/:id", DefaultPackageController.getById);
router.put("/editPackage/:id", DefaultPackageController.updateDefaultPackage);
router.delete("/deletePackage/:id", DefaultPackageController.deleteDefaultPackage);

// Export Router
module.exports = router;

