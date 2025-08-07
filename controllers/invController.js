const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

// additional enhancement
const favoritesModel = require("../models/favorites-model")


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
    accountData: res.locals.accountData,
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


// This part is for the favotire
  let is_favorite = false
  if (res.locals.accountData) {
    const account_id = res.locals.accountData.account_id
    is_favorite = await favoritesModel.isFavorite(account_id, inv_id)
  }

  res.render("./inventory/detail", {
    title, 
    nav,
    detail,
    // part of the favorite
    data,
    vehicle: {
      inv_id: data.inv_id,
      is_favorite,
    }
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
    res. status(501).render("./inventory/add-classification", {
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
      res.status(500).render("./inventory/add-inventory", {
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
  const classificationSelect = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    classificationSelect,
    error:null,
  })
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Update the inventory
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  console.log("itemData:", itemData)
  res.render("./inventory/edit-inventory", {
    title: "Edit" + itemName,
    nav,
    classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  })
}

/* ***************************
 *  Process Update the inventory
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
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

  const updateResult = await invModel.updateInventory(
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
  )

    
  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
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
    classification_id
    })
  }
}

/* ***************************
 *  Delete confirmation view
 * ************************** */
invCont.showDeleteConfirmationView = async function (req, res, next) {
  const nav = await utilities.getNav()
  const inv_id = parseInt(req.params.inv_id)

  try {
    const data = await invModel.getInventoryById(inv_id)
    if (!data) {
      req.flash("notice", "Inventory item not found.")
      return res.redirect("inv/management")
    }

    const item = data
    const name = `${item.inv_make} ${item.inv_model}`

    res.render("inventory/delete-confirm", {
      title: `Delete ${name} | Inventory Managemet`,
      nav,
      message: null,
      inv_id: item.inv_id,
      inv_make: item.inv_make,
      inv_model: item.inv_model,
      inv_year: item.inv_year,
      inv_price: item.inv_price,
      errors: null,
    })
  } catch (error) {
    return next(error)
  }
}

/* ***************************
 *  Process Delete item
 * ************************** */
invCont.deleteInventoryItem = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)

  try {
    const result = await invModel.deleteInventoryItem(inv_id)

    if (result.rowCount === 1) {
      req.flash("success", "inventory item deleted successfully")
      res.redirect("/inv/management")
    } else {
      req.flash("error", "Fialed to delete inventory item.")
      res.redirect(`/inv/delete/${inv_id}`)
    }
  } catch (error) {
    return next(error)
  }
  
}

module.exports = invCont