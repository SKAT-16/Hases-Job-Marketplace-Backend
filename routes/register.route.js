const authorization = require('../middleware/authorization');
const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { User, validateUserAccount } = require('../models/user.model');
const { JobSeeker, checkJobSeekerProfileCompletion, validateJobSeekerProfile } = require('../models/job_seeker.model');
const { Company, checkCompanyProfileCompletion, validateCompanyProfile } = require('../models/company.model');

const router = express.Router();

router
  .post('/account', async (req, res) => {
    const { error } = validateUserAccount(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('Email already in use.');

    user = await User.findOne({ user_name: req.body.user_name });
    if (user) return res.status(400).send('Username already in use.');

    user = new User(req.body);

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user = await user.save();

    const token = jwt.sign({ _id: user._id }, process.env.JWT_PRIVATE_KEY);
    res.send(token);
  });


module.exports = router;