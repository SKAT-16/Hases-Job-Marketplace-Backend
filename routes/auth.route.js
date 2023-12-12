const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const {JobSeeker} = require('../models/job_seeker.model');
const {Company} = require('../models/company.model');

router.post('/job-seeker', async (req, res) => {
  const {error} = validate(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  let user = await JobSeeker.findOne({email: req.body.email});
  if(!user) return res.status(400).send('Invalid email');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if(!user) return res.status(400).send('Invalid password');

  const token = jwt.sign({_id: user._id}, process.env.JWT_PRIVATE_KEY);
  res.send({token, profile_complete: user.profile_completed});
});

router.post('/company', async (req, res) => {
  const {error} = validate(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  let user = await Company.findOne({company_email: req.body.email});
  if(!user) return res.status(400).send('Invalid email');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if(!user) return res.status(400).send('Invalid password');

  const token = jwt.sign({_id: user._id}, process.env.JWT_PRIVATE_KEY);
  res.send({token, profile_complete: user.profile_completed});
});

function validate(req) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255)
  });

  return schema.validate(req);
}

module.exports = router;