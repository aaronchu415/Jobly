const express = require('express')
const router = new express.Router()
const Company = require('../models/companies')
const ExpressError = require('../helpers/expressError')

const jsonschema = require("jsonschema");
const companySchema = require("../schemas/companySchema.json");

/** POST /   companyData => {company: companyData} */

router.post("/", async function (req, res, next) {
    try {
        console.log(req.body)
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


module.exports = router