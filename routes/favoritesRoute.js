const express = require("express")
const router = new express.Router()
const favoritesController = require("../controllers/favoritesController")
const checkLogin = require("../utilities/checkLogin")
const utilities = require("../utilities")

router.post("/toggle", checkLogin, utilities.handleErrors(favoritesController.toggleFavorite))

router.get("/", checkLogin, utilities.handleErrors(favoritesController.viewFavorites))

router.post("/add", checkLogin, utilities.handleErrors(favoritesController.toggleFavorite))

router.post("/remove", checkLogin, utilities.handleErrors(favoritesController.removeFavoriteHandler))

module.exports = router
