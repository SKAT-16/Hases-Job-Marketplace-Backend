const axios = require('axios');
const mongoose = require("mongoose");
const authorization = require('../middleware/authorization');
const express = require('express');
const multer = require('multer');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { User } = require('../models/user.model');
const { JobSeeker, checkJobSeekerProfileCompletion, validateJobSeekerProfile } = require('../models/job_seeker.model');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router
  .post('/new-profile', [authorization, upload.array('files', 2)], async (req, res) => {
    if (req.files && req.files.length > 0) {
      try {
        let response;
        if (req.files[0]) {
          response = await axios.post('http://localhost:3000/api/upload?fileType=image&accountType=job-seeker', { file: req.files[0], user_id: req.user_id });
          req.body.user_image = response.data.fileLink + "&raw=1";
        }
        if (req.files[1]) {
          response = await axios.post('http://localhost:3000/api/upload?fileType=resume&accountType=job-seeker', { file: req.files[1], user_id: req.user_id });
          req.body.resume = response.data.fileLink.replace('dl=0', 'dl=1');
        }
      } catch (ex) { console.log("Error uploading files!"); }
    }

    const { error } = validateJobSeekerProfile(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    req.user_id = new mongoose.Types.ObjectId(req.user_id);
    let user = await User.findById(req.user_id);
    if (!user) return res.status(400).send("User hasn't registered yet!");

    user.role = 'job-seeker';
    await user.save();

    user = new JobSeeker(req.body);
    user.user_id = req.user_id;
    user.profile_completed = checkJobSeekerProfileCompletion(req.body);
    user = await user.save();

    res.send(`JobSeeker-${user._id} profile saved!`);
  })
  .put('/edit-profile', [authorization, upload.array('files', 2)], async (req, res) => {
    if (req.files && req.files.length > 0) {
      try {
        let response;
        if (req.files[0]) {
          response = await axios.post('http://localhost:3000/api/upload?fileType=image&accountType=job-seeker', { file: req.files[0], user_id: req.user_id });
          req.body.user_image = response.data.fileLink + "&raw=1";
        }
        if (req.files[1]) {
          response = await axios.post('http://localhost:3000/api/upload?fileType=resume&accountType=job-seeker', { file: req.files[1], user_id: req.user_id });
          req.body.resume = response.data.fileLink.replace('dl=0', 'dl=1');
        }
      } catch (ex) { console.log("Error uploading files!"); }
    }

    const { error } = validateJobSeekerProfile(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    req.user_id = new mongoose.Types.ObjectId(req.user_id);
    let user = await JobSeeker.findOne({ user_id: req.user_id });
    if (!user) return res.status(400).send("User not logged in!");

    user.set(req.body);
    user.profile_completed = checkJobSeekerProfileCompletion(req.body);
    user.updated_at = new Date().toISOString();
    await user.save();

    res.send(`JobSeeker-${user._id} profile edited!`);
  });


module.exports = router;