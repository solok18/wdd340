const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build Detail view
 * ************************** */
invCont.buildDetailView = async function(req, res, next) {
  const inv_id = req.params.inv_id
  const data = await invModel.getVehicleById(inv_id)
  const detail = utilities.buildVehicleDetail(data)
  let nav = await utilities.getNav()
  const title = `${data.inv_make} ${data.inv_model}`
  res.render("./inventory/detail", {
    title, 
    nav,
    detail,
  })
}

/* ***************************
 *  Show add-classification
 * ************************** */
invCont.showAddClassificationForm = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  }
  )
}


invCont.buildClassification = async function (req, res) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  const regResult = await invModel.buildClassification(classification_name)

  if (regResult) {
    req.flash("notice", `Congratulations, ${classification_name} was successfully added.`)
    res. status(201).redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the classification failed.")
    res. status(501).render("./invetory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null
    })
  }
}

/* ***************************
 *  Inventory View
 * ************************** */
invCont.showAddInventoryForm = async function (req, res, next) {
  let nav = await utilities.getNav()
  try {
    const data = await invModel.getClassifications()
    const classificationList = data.rows

    res.render("./inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      errors:null,
      classificationList,
      message: req.flash("message")
    })
    } catch (error) {
      req.flash("notice", "Sorry, the inventory failed.")
      res.status(500).render("./invetory/add-inventory", {
        title: "Add Vehicle",
        nav,
        errors: null
    })
  }  
}


invCont.addInventory = async function (req, res) {
  let nav = await utilities.getNav()

  const {
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
  } = req.body

  const addResult = await invModel.addInventory(
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  )

  if (addResult) {
    req.flash("notice", `The ${inv_make} ${inv_model} was successfully added.`)
    res.status(201).redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the insert failed.")
    const classificationList = (await invModel.getClassifications()).rows
    res.status(501).render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      errors: null,
    })
  }
}

/* ***************************
 *  Management View
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
  })
}

module.exports = invCont