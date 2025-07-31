// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")

//Route for 
router.get("/", utilities.handleErrors(invController.buildManagementView))


// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Route to build single view
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildDetailView))

router.get("/add-classification", utilities.handleErrors(invController.showAddClassificationForm))

router.post("/add-classification", utilities.handleErrors(invController.buildClassification))

router.get("/add-inventory", utilities.handleErrors(invController.showAddInventoryForm))

router.post("/add-inventory", utilities.handleErrors(invController.addInventory))

router.get("/management", utilities.handleErrors(invController.buildManagementView))

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

module.exports = router;