const utilities = require("../utilities/")
const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")

/* ****************************************
 *  Validation rules for new inventory data
 * **************************************** */
function newInventoryRules() {
  return [
    body("inv_make")
      .trim()
      .notEmpty()
      .withMessage("Make is required."),
    body("inv_model")
      .trim()
      .notEmpty()
      .withMessage("Model is required."),
    body("inv_year")
      .isInt({ min: 1900, max: new Date().getFullYear() })
      .withMessage("Year must be a valid number."),
    body("inv_price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),
    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Mileage must be a positive integer."),
    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Color is required."),
    body("inv_description")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters."),
    body("classification_id")
      .notEmpty()
      .withMessage("Classification is required."),
  ]
}

/* ****************************************
 *  Middleware to check update inventory data
 *  Redirect errors back to edit-inventory view
 * **************************************** */
async function checkUpdateData(req, res, next) {
  const errors = validationResult(req)
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  if (!errors.isEmpty()) {
    try {
      const classificationData = await invModel.getClassifications()
      return res.status(400).render("inventory/edit-inventory", {
        title: "Edit " + inv_make + " " + inv_model,
        classificationSelect: classificationData.rows,
        errors: errors.array(),
        inv_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,
        nav: await require("./index").getNav(),
      })
    } catch (error) {
      return next(error)
    }
  }
  next()
}

module.exports = {
  newInventoryRules,
  checkUpdateData,
}
