const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { User, validateUserAccount } = require('../models/user.model');

const router = express.Router();

router
  .post('/', async (req, res) => {
    let user = await User.findOne({
      $or: [
        { user_name: req.body.credential },
        { email: req.body.credential }
      ]
    });

    if (!user) return res.status(400).send('Invalid email or username!');

    if (user.verification.code !== req.body.code)
      return res.status(400).send('Incorrect code');

    user.verification.isVerified = true;
    user = await user.save();

    const token = jwt.sign({ _id: user._id }, process.env.JWT_PRIVATE_KEY);
    res.send(token);
  });

module.exports = router;