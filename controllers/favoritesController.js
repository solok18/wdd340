const utilities = require("../utilities/")
const favoritesModel = require("../models/favorites-model")


// toggle within vehicles for favorite
async function toggleFavorite(req, res, next) {
    const account_id = res.locals.accountData.account_id
    const inv_id = parseInt(req.body.inv_id)
    let nav = await utilities.getNav()

    try {
        const isFav = await favoritesModel.isFavorite(account_id, inv_id)
        if (isFav) {
            await favoritesModel.removeFavorite(account_id, inv_id)
            req.flash("notice", "Vehicle removed from favorites.")
        } else {
            await favoritesModel.addFavorite(account_id, inv_id)
            req.flash("notice", "Vehicle added to favorites.")
        }
        res.redirect("/favorites")
    } catch (error) {
        console.error("Error in toggleFavorite:", error)
        res.status(500).render("errors/error", {
            title:"Favorite Toggle Error",
            message: "An error occurred while updating your favorites.",
            nav,
            error,
        })
    }
}

// Show all favorite
async function viewFavorites(req, res, next) {
    try {
        const account_id = res.locals.accountData.account_id
        const favorites = await favoritesModel.getFavoritesByAccount(account_id)
        console.log('Favorites returned:', favorites);
        let nav = await utilities.getNav()

        res.render("favorites/list", {
            title: "My Wishlist",
            nav,
            favorites,
        })
    } catch (error) {
        console.error("Error in viewFavorites: ", error)
        res.status(500).render("errors/error", {
            title: "Whishlist Error",
            message: "An error occurred while retrieving your wishlist.",
            error,
        })
    }
}


async function removeFavoriteHandler(req, res, next) {
    try{
        const account_id = res.locals.accountData.account_id
        const inv_id = parseInt(req.body.inv_id)
        await favoritesModel.removeFavorite(account_id, inv_id)
        req.flash("notice", "Vehicle has been removed from favorites.")
        res.redirect("/favorites")
    } catch (error) {
        console.error("Error in removeFavorite: ", error)
        res.status(500).render("errors/error", {
            title:"Remove Favorite Error",
            message: "Could not remove vehicle from favorites.",
            error,
        })
    }
    
}

module.exports = {toggleFavorite, viewFavorites, removeFavoriteHandler}