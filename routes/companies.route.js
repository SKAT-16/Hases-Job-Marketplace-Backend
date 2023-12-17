const axios = require('axios');
const mongoose = require("mongoose");
const authorization = require('../middleware/authorization');
const express = require('express');
const multer = require('multer');

const { User } = require('../models/user.model');
const { Company, checkCompanyProfileCompletion, validateCompanyProfile } = require('../models/company.model');
const JobCategory = require('../models/job_category.model');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router
  .get('/categories', authorization, async (req, res) => {
    let categories = await JobCategory.find({}).select('category');
    res.send(categories);
  })
  .get('/:category_id/skills', authorization, async (req, res) => {
    const category_id = req.params.category_id;
    let skills = await JobCategory.find({_id: category_id}).select('skills');
    res.send(skills);
  })
  .post('/new-profile', [authorization, upload.single("file")], async (req, res) => {
    const { error } = validateCompanyProfile(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    if (req.file) {
      const response = await axios.post('http://localhost:3000/api/upload?fileType=image&accountType=company', { file: req.file, user_id: req.user_id });
      req.body.company_logo = response.data.fileLink + "&raw=1";
      console.log(req.body.company_logo);
    }

    req.user_id = new mongoose.Types.ObjectId(req.user_id);
    let user = await User.findById(req.user_id);
    if (!user) return res.status(400).send("User hasn't registered yet!");

    user = new Company(req.body);
    user.user_id = req.user_id;
    user.profile_completed = checkCompanyProfileCompletion(req.body);
    user = await user.save();

    res.send(`Company-${user._id} profile saved!`);
  })
  .put('/edit-profile', [authorization, upload.single('file')], async (req, res) => {
    if (req.file) {
      const response = await axios.post('http://localhost:3000/api/upload?fileType=image&accountType=company', { file: req.file, user_id: req.user_id });
      if (response.data.fileLink)
        req.body.company_logo = response.data.fileLink + "&raw=1";
    }

    const { error } = validateCompanyProfile(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    req.user_id = new mongoose.Types.ObjectId(req.user_id);
    let user = await Company.findOne({ user_id: req.user_id });
    if (!user) return res.status(400).send("User not logged in!");

    user.set(req.body);
    user.profile_completed = checkCompanyProfileCompletion(req.body);
    user.updated_at = new Date().toISOString();
    await user.save();

    res.send(`Company-${user._id} profile edited!`);
  });


module.exports = router;