const express = require('express');
const router = new express.Router();
const User = require('../models/users');
const ExpressError = require('../helpers/expressError');

const jsonschema = require("jsonschema");
const userSchema = require("../schemas/userSchema.json");

router.get("/", async function (req, res, next) {
  try {
    const users = await User.findAll(req.query);
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

router.get("/:username", async function (req, res, next) {
  try {
    const user = await User.findOne(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

router.post("/", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, userSchema);
    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    const user = await User.create(req.body);
    return res.status(201).json({ user });
  } catch (err) {
    return next(err);
  }
});

router.patch("/:username", async function (req, res, next) {
  try {

    let originalUser = await User.findOne(req.params.username, true);

    //spread original company and req.body and assign/update request values to the orignal record
    const patchedUser = { ...originalUser, ...req.body };

    const result = jsonschema.validate(patchedUser, userSchema);
    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }

    const user = await User.update(req.params.username, req.body);
    return res.json({ user });

  } catch (err) {
    return next(err);
  }
});

router.delete("/:username", async function (req, res, next) {
  try {
    await User.remove(req.params.username);
    return res.json({ message: "User deleted" });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
