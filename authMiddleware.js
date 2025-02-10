const isAuthenticated = (req, res, next) => {
    if (req.session.sellerId && req.session.contractorId && req.session.user) {
        return next();
    }
    req.flash("error", "You need to be logged in to access this page.");
    res.redirect("/login");
};


const isAuthorized = (req, res, next) => {
    const userId = req.user._id.toString(); // Logged-in user
    const targetUserId = req.params.userId; // User being accessed

    if (userId === targetUserId) {
        return next(); // If the user is accessing their own data, allow it
    }

    req.flash("error", "You are not authorized to perform this action.");
    return res.redirect("/");
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        return next(); // Proceed if user is an admin
    }
    req.flash("error", "Admin access only.");
    res.redirect("/");
};

// Export Middleware Functions
module.exports = { isAuthenticated, isAuthorized, isAdmin };
