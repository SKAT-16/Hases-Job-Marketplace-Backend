const authorization = require('../middleware/authorization');
const express = require('express');
const Joi = require('joi');
const { JobSeeker, validateJobSeekerAccount, validateJobSeekerProfile } = require('../models/job_seeker.model');
const { Company, validateCompanyAccount, validateCompanyProfile } = require('../models/company.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();

router
  .post('/job-seeker/account', async (req, res) => {
    const { error } = validateJobSeekerAccount(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await JobSeeker.findOne({ email: req.body.email });
    if (user) return res.status(400).send('User already registered');

    user = new JobSeeker(req.body);

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user = await user.save();

    const token = jwt.sign({ _id: user._id }, process.env.JWT_PRIVATE_KEY);
    res.send(token);
  })
  .post('/job-seeker/profile', authorization, async (req, res) => {
    const { error } = validateJobSeekerProfile(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await JobSeeker.findOne({ _id: req.user_id });
    if (!user) return res.status(400).send('User hasn\'t registered yet!');

    user.profile_details = req.body;
    user.profile_completed = true;
    user = await user.save();

    res.send(`Job-Seeker: ${user._id} profile saved!`);
  });

router
  .post('/company/account', async (req, res) => {
    const { error } = validateCompanyAccount(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await Company.findOne({ company_email: req.body.company_email });
    if (user) return res.status(400).send('User already registered');

    user = new Company(req.body);

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    user = await user.save();

    const token = jwt.sign({ _id: user._id }, process.env.JWT_PRIVATE_KEY);
    res.send(token);
  })
  .post('/company/profile', authorization, async (req, res) => {
    const { error } = validateCompanyProfile(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await Company.findOne({ _id: req.user_id });
    if (!user) return res.status(400).send('User hasn\'t registered yet!');

    user.profile_details = req.body;
    user.profile_completed = true;
    user = await user.save();

    res.send(`Company: ${user._id} profile saved!`);
  });


module.exports = router;