const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, validateUserAccount } = require('../models/user.model');
const mailSender = require('../utils/mailer');

const router = express.Router();

router
  .post('/account', async (req, res) => {
    const { error } = validateUserAccount(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('email already in use.');

    user = await User.findOne({ user_name: req.body.user_name });
    if (user) return res.status(400).send('username already in use.');

    user = new User(req.body);
    user.role = req.body.role;

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    user.verification.code = generateVerificationCode();
    const emailStatus = await mailSender(user.email, user.verification.code);
    if (!emailStatus.response.includes('OK'))
      return res.status(400).send('Unable to send verification code!');

    user = await user.save();
    res.send('User registered successfully!');
  });

function generateVerificationCode() {
  const codeLength = 6;
  const min = Math.pow(10, codeLength - 1);
  const max = Math.pow(10, codeLength) - 1;
  const verificationCode = Math.floor(Math.random() * (max - min + 1)) + min;
  return verificationCode.toString();
}

module.exports = router;