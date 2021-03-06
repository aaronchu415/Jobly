/** Express app for jobly. */

/** ExpressError extends the normal JS error so we can easily
 *  add a status when we make an instance of it.
 *
 *  The error-handling middleware will return this.
 */

const express = require("express");
const ExpressError = require("./helpers/expressError");
const morgan = require("morgan");
const companyRoutes = require('./routes/companies');
const jobRoutes = require('./routes/jobs');
const userRoutes = require('./routes/users');
const { authenticateJWT } = require("./middleware/auth");
const app = express();

app.use(express.json());
app.use(authenticateJWT);
app.use(morgan("tiny")); // add logging system
app.use('/companies', companyRoutes);
app.use('/jobs', jobRoutes);
app.use('/users', userRoutes);

/** 404 handler */

app.use(function (req, res, next) {
  const err = new ExpressError("Not Found", 404);

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use(function (err, req, res, next) {
  res.status(err.status || 500);

  if (process.env.NODE_ENV !== 'test') {
    console.error(err.stack);
  }

  return res.json({
    status: err.status,
    message: err.message
  });
});

module.exports = app;
