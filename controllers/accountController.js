// Require items
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    req.flash("notice", "This is a flash message.")
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null
    })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    req.flash("notice", "This is a flash message.")
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null
    })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

// Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  } 

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function buildAccount(req, res, next) {
  const nav = await utilities.getNav()
  const account_id = res.locals.accountData.account_id

  try{
    const account = await accountModel.getAccountById(account_id)
    
    res.render("account/account", {
      title: "Account Management",
      nav,
      account,
      errors: null,
      message: null,
    })
  } catch (error) {
    req.flash("notice", "There was a problem loading your account.")
    res.redirect("/account/login")
  }
}

/* ****************************************
 *  Deliver Update Account View
 * ************************************ */
async function buildUpdateAccountView(req, res, next) {
  const nav = await utilities.getNav()
  const accountId = req.params.accountId

  try {
    // Fetch the current account data by id from the model
    const accountData = await accountModel.getAccountById(accountId)
    console.log(`Rendering update view for accountId: ${req.params.accountId}`);

    if (!accountData) {
      req.flash("notice", "Account not found")
      return res.redirect("/account")
    }

    res.render("account/update-account", {
      title: "Update Account",
      nav,
      accountData,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 *  Process account update
 * ************************************ */
async function updateAccount (req, res, next) {
  let nav = await utilities.getNav()
  const { account_id, account_firstname, account_lastname, account_email } = req.body

  try {
    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    )

    if (updateResult) {
      const accountData = await accountModel.getAccountById(account_id)
      delete accountData.account_password
      const token = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })

      res.cookie("jwt", token, {
        httpOnly: true,
        secure: false,
        maxAge: 3600000
      })

      req.flash("notice", "Account information updated successfully.")
      return res.redirect("/account/")
    } else {
      return res.render("account/update-account", {
        title: "Update Account",
        nav,
        errors: ["Update failed. Please try again."],
        locals: {
          account_id,
          account_firstname,
          account_lastname,
          account_email
        }
      })
    }
  } catch (error) {
    console.error("Update Error:", error)
    return res.render("account/update-account", {
      title: "Update Account",
      nav,
      errors: ["An error occurred. Please try again."],
      locals: {
        account_id,
        account_firstname,
        account_lastname,
        account_email
      }
    })
  }
}

/* ****************************************
 *  Process password change
 * ************************************ */
async function updatePassword(req, res) {
  try { 
    let { account_password, account_id } = req.body

    account_id = parseInt(account_id)

    // Hash the new password
    const hashedPassword = await bcrypt.hash(account_password, 10)

    // Update password in the database
    const updateResult = await accountModel.updateAccountPassword(hashedPassword, account_id)

    if (updateResult) {
      req.flash("notice", "Password updated succefully.")
      res.redirect("/account/")
    } else {
      req.flash("notice", "Password updated failed.")
      res.redirect("/account/")
    }
  } catch (error) {
    console.error("Update password error:", error)
    req.flash("notice", "An error occured while changing your password.")
    res.redirect("/account/")
  }
}

/* ****************************************
 *  Process logout request
 * ************************************ */
async function logout(req, res, mext) {
  try {
    res.clearCookie("jwt")
    req.flash("notice", "You have successfully logged out.")
    res.redirect("/")
  } catch (error) {
    next(error)
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccount, buildUpdateAccountView, updateAccount, updatePassword, logout}