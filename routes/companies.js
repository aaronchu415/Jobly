const express = require('express')
const router = new express.Router()
const Company = require('../models/companies')
const ExpressError = require('../helpers/expressError')

const jsonschema = require("jsonschema");
const companySchema = require("../schemas/companySchema.json");

/** GET / => {companies: [company, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const companies = await Company.findAll(req.query);
    return res.json({ companies });
  } catch (err) {
    return next(err);
  }
});

router.get("/:handle", async function (req, res, next) {
  try {
    const company = await Company.findOne(req.params.handle);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
})

/** POST /   companyData => {company: companyData} */

router.post("/", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, companySchema);
    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    const company = await Company.create(req.body);
    return res.status(201).json({ company });
  } catch (err) {
    return next(err);
  }
});

router.patch("/:handle", async function(req, res, next) {
  try {

    //get company record by handle
    let originalCompany = await Company.findOne(req.params.handle);

    //spread original company and req.body and assign/update request values to the orignal record
    const patchedCompany = { ...originalCompany, ...req.body }

    const result = jsonschema.validate(patchedCompany, companySchema);
    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }

    const company = await Company.update(req.params.handle, req.body);
    return res.json( { company })
    
  } catch(err) {
    return next(err)
  }
})

/** DELETE /[handle]   => {message: "Company deleted"} */

router.delete("/:handle", async function (req, res, next) {
  try {
    await Company.remove(req.params.handle)
    return res.json({ message: "Company deleted" })
  } catch (err) {
    return next(err)
  }
})


module.exports = router