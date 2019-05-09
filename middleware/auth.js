/** Middleware for handling req authorization for routes. */
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** Middleware: Authenticate user. */

function authenticateJWT(req, res, next) {
  try {
    // const tokenFromBody = req.body._token;
    const tokenFromHeader = req.headers.authorization;
    const payload = jwt.verify(tokenFromHeader, SECRET_KEY);
    req.user = payload; // create a current user
    // console.log(`CURRENT USER ${req.user.username, req.user.is_admin}`);

    return next();
  } catch (err) {
    return next();
  }
}
// end

/** Middleware: Requires user is authenticated. */

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    
    return next({ status: 401, message: "Unauthorized" });
  } else {
    return next();
  }
}

// end

/** Middleware: Requires correct username. */

function ensureCorrectUser(req, res, next) {
  try {
    if (req.user.username === req.params.username) {
      return next();
    } else {
      return next({ status: 401, message: "Unauthorized" });
    }
  } catch (err) {
    // errors would happen here if we made a request and req.user is undefined
    return next({ status: 401, message: "Unauthorized" });
  }
}


function ensureAdmin(req, res, next) {
  try {
    if (req.user.is_admin) {
      return next();
    } else {
      return next({ status: 401, message: "Unauthorized" });
    }
  } catch (err) {
    // errors would happen here if ewe made a request and req.user is undefined
    return next({ status: 401, message: "Unauthorized" });
  }
}
// end

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
  ensureAdmin
};
