const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">HOME</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="see our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>"
        list += "</li>"     
    })
    list += "</ul>"
    return list
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


module.exports = Util



/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}


/* **************************************
* Build the vehicle view HTML
* ************************************ */
Util.buildVehicleDetail = function(vehicle) {
  let detail = ''
  if (vehicle) {
    detail += '<div class="vehicle-detail">'
    detail +=   '<div class="vehicle-image">'
    detail +=     '<img src="'+ vehicle.inv_image +'" alt="Image of '+ vehicle.inv_make +' ' + vehicle.inv_model +'" />'
    detail +=   '</div>'
    detail +=   '<div class="vehicle-info">'
    detail +=     '<h2>' + vehicle.inv_year + ' ' + vehicle.inv_make +' ' + vehicle.inv_model +' Details</h2>'
    detail +=     '<p><strong>Price:</strong> $' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</p>'
    detail +=     '<p><strong>Milage:</strong> ' + new Intl.NumberFormat('en-US').format(vehicle.inv_miles) + '</p>'
    detail +=     '<p><strong>Color:</strong> ' + vehicle.inv_color + '</p>'
    detail +=     '<p><strong>Description:</strong> ' + vehicle.inv_description + '</p>'
    detail +=   '</div>'
    detail += '</div>'
  } else {
    detail += '<p class="notice">Sorry, the request vehicle could not be found. </p>'
  }
  return detail
}