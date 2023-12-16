const authorization = require('../middleware/authorization');
const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { User} = require('../models/user.model');
const { Company, checkCompanyProfileCompletion, validateCompanyProfile } = require('../models/company.model');

const router = express.Router();

router
  .post('/profile', authorization, async (req, res) => {
    const { error } = validateCompanyProfile(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    req.body.user_id = new mongoose.Types.ObjectId(req.user_id);
    let user = await User.findOne({ user_id: req.body.user_id });
    if (!user) return res.status(400).send("User hasn't registered yet!");

    user.role = 'company';
    await user.save();

    user = new Company(req.body);
    user.profile_completed = checkCompanyProfileCompletion(req.body);
    user = await user.save();

    res.send(`Company: ${user._id} profile saved!`);
  });


module.exports = router;