const express = require("express");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
const { User, validateUserAccount } = require("../models/user.model");
const { Company } = require("../models/company.model");
const { JobSeeker } = require("../models/job_seeker.model");
const mailSender = require("../utils/mailer");

router.post("/", async (req, res) => {
  const { error } = validateCredentials(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({
    $or: [{ user_name: req.body.credential }, { email: req.body.credential }],
  });
  if (!user) return res.status(400).send("Invalid credential");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Incorrect password");

  if (!user.verification.isVerified) {
    user.verification.code = generateVerificationCode();
    user = await user.save();

    try {
      await mailSender(user.email, user.verification.code);
      return res.status(400).send({ msg: "Unverified user!", role: user.role });
    } catch (ex) {
      return res.status(400).send("Unable to send verification code!");
    }
  }

  let role;
  if (user.role === "company")
    role = await Company.findOne({ user_id: user._id });
  else if (user.role === "job-seeker")
    role = await JobSeeker.findOne({ user_id: user._id });

  const token = jwt.sign({ _id: user._id }, process.env.JWT_PRIVATE_KEY);
  let data = { token, role: user.role };
  if (!role) data.msg = "Incomplete user profile!";

  res.send(data);
});

const validateCredentials = (data) => {
  const schema = Joi.object({
    credential: Joi.string().required(),
    password: Joi.string().min(8).required(),
  });

  return schema.validate(data);
};

function generateVerificationCode() {
  const codeLength = 6;
  const min = Math.pow(10, codeLength - 1);
  const max = Math.pow(10, codeLength) - 1;
  const verificationCode = Math.floor(Math.random() * (max - min + 1)) + min;
  return verificationCode.toString();
}

module.exports = router;
