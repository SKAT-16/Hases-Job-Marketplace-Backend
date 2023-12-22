const mongoose = require("mongoose");
const Joi = require("joi");

const userSchema = new mongoose.Schema({
  user_name: String,
  email: String,
  password: String,
  role: { type: String, default: "guest" },
  verification: {
    code: { type: String, default: "" },
    isVerified: { type: Boolean, default: false }
  }
});

const User = mongoose.model('User', userSchema);

const validateUserAccount = function (userAccount) {
  const schema = Joi.object({
    role: Joi.string().required(),
    user_name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
  });

  return schema.validate(userAccount);
}

module.exports = { User, validateUserAccount };