const authorization = require('../middleware/authorization');
const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { User } = require('../models/user.model');
const { JobSeeker, checkJobSeekerProfileCompletion, validateJobSeekerProfile } = require('../models/job_seeker.model');

const router = express.Router();

router
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
  });


module.exports = router;