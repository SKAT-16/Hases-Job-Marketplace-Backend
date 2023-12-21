const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const { User, validateUserAccount } = require('../models/user.model');
const mailSender = require('../utils/mailer');

router.post('/', async (req, res) => {
  const { error } = validateCredentials(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({
    $or: [
      { user_name: req.body.credential },
      { email: req.body.credential }
    ]
  });
  if (!user) return res.status(400).send('Invalid email or username');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Incorrect password');

  if (!user.verification.isVerified) {
    user.verification.code = generateVerificationCode();
    const emailStatus = await mailSender(user.email, user.verification.code);
    if (!emailStatus.response.includes('OK'))
      return res.status(400).send('Unable to send verification code!');

    return res.status(400).send('Unverified user!');
  }

  const token = jwt.sign({ _id: user._id }, process.env.JWT_PRIVATE_KEY);
  res.send({ token, role: user.role});
});

const validateCredentials = (data) => {
  const schema = Joi.object({
    credential: Joi.string().required(),
    password: Joi.string().min(8).required()
  });

  return schema.validate(data);
}

function generateVerificationCode() {
  const codeLength = 6;
  const min = Math.pow(10, codeLength - 1);
  const max = Math.pow(10, codeLength) - 1;
  const verificationCode = Math.floor(Math.random() * (max - min + 1)) + min;
  return verificationCode.toString();
}

module.exports = router;