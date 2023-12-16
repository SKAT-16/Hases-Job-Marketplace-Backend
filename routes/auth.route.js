const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const {User, validateUserAccount} = require('../models/user.model');

router.post('/', async (req, res) => {
  const {error} = validateUserAccount(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({$or : [
    { user_name: req.body.credential },
    { email: req.body.credential }
  ]});
  if(!user) return res.status(400).send('Invalid email or username');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if(!validPassword) return res.status(400).send('Incorrect password');

  const token = jwt.sign({_id: user._id}, process.env.JWT_PRIVATE_KEY);
  res.send({token, role: user.role});
});

module.exports = router;