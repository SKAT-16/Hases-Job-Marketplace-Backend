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
    if (user) return res.status(400).send('User already registered');

    user = new User(req.body);

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user = await user.save();

    const token = jwt.sign({ _id: user._id }, process.env.JWT_PRIVATE_KEY);
    res.send(token);
  })
  .post('/job-seeker/profile', authorization, async (req, res) => {
    const { error } = validateJobSeekerProfile(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    req.body.user_id = new mongoose.Types.ObjectId(req.user_id);
    let user = await User.findOne({ user_id: req.body.user_id });
    if (!user) return res.status(400).send("User hasn't registered yet!");

    user.role = 'job-seeker';
    await user.save();

    user = new JobSeeker(req.body);
    user.profile_completed = checkJobSeekerProfileCompletion(req.body);
    user = await user.save();

    res.send(`Job-Seeker: ${user._id} profile saved!`);
  })
  .post('/company/profile', authorization, async (req, res) => {
    const { error } = validateCompanyProfile(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    req.body.user_id = new mongoose.Types.ObjectId(req.user_id);
    let user = await User.findOne({ user_id: req.body.user_id });
    if (!user) return res.status(400).send("User hasn't registered yet!");

    user.role = 'job-seeker';
    await user.save();

    user = new Company(req.body);
    user.profile_completed = checkCompanyProfileCompletion(req.body);
    user = await user.save();

    res.send(`Company: ${user._id} profile saved!`);
  });


module.exports = router;