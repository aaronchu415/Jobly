const express = require('express');
const router = new express.Router();
const Job = require('../models/jobs');
const ExpressError = require('../helpers/expressError');
const {ensureLoggedIn, ensureAdmin} = require("../middleware/auth");


const jsonschema = require("jsonschema");
const jobSchema = require("../schemas/jobSchema.json");

/** GET / => {jobs: [jobsData, ...]}  */

router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const jobs = await Job.findAll(req.query);
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const job = await Job.findOne(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** POST /   jobs  => {job: jobData} */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, jobSchema);
    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {

    //get company record by handle
    let originalJob = await Job.findOne(req.params.id, true);

    //spread original company and req.body and assign/update request values to the orignal record
    const patchedJob = { ...originalJob, ...req.body };


    const result = jsonschema.validate(patchedJob, jobSchema);
    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }

    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });

  } catch (err) {
    return next(err);
  }
});

/** DELETE /[handle]   => {message: "Company deleted"} */

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Job.remove(req.params.id);
    return res.json({ message: "Job deleted" });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;