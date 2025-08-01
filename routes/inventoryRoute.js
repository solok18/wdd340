// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const { newInventoryRules, checkUpdateData } = require("../utilities/inventory-validation")

//Route for 
router.get("/", utilities.handleErrors(invController.buildManagementView))


// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Route to build single view
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildDetailView))

// Route for adding classification

router.get("/add-classification", utilities.handleErrors(invController.showAddClassificationForm))

router.post("/add-classification", utilities.handleErrors(invController.buildClassification))

// Route for adding inventory

router.get("/add-inventory", utilities.handleErrors(invController.showAddInventoryForm))

router.post("/add-inventory", utilities.handleErrors(invController.addInventory))

//  Route for inventory management
router.get("/management", utilities.handleErrors(invController.buildManagementView))

//  Route for get inventory Json by classification
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to build the edit inventory view
router.get("/edit/:inv_id", invController.editInventoryView, utilities.handleErrors(invController.editInventoryView))

router.post("/update/", newInventoryRules(), checkUpdateData, utilities.handleErrors(invController.updateInventory))
module.exports = router;