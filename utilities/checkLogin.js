function checkLogin(req, res, next) {
    console.log('accountData in checkLogin:', res.locals.accountData);
    if (res.locals.accountData && Object.keys(res.locals.accountData).length > 0) {
        return next()
    }
    req.flash("error", "You must be logged in to access that page.")
    res.redirect("/account/login")
}

module.exports = checkLogin