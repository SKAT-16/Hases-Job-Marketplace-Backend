const Joi = require("joi");
const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  company_name: String,
  company_email: String,
  password: String,
  phone: String,
  profile_details: {
    company_logo: {
      type: Buffer,
      default: null,
      contentType: String
    },
    buisness_stream: String,
    profile_description: String,
    establishment_date: Date,
    company_website: {
      type: String,
      default: "-"
    }
  },
  profile_completed: {
    type: Boolean,
    default: false
  },
  created_at: { type: Date, default: Date.now },
  updated_at: Date
});

const Company = mongoose.model('Company', companySchema);
const validateCompanyAccount = function (companyAccount) {
  const schema = Joi.object({
    company_name: Joi.string().min(2).required(),
    company_email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    phone: Joi.string().pattern(/^(\+251|0)[1-57-9]\d{8}$/).required()
  });

  return schema.validate(companyAccount);
}

const validateCompanyProfile = function (companyProfile) {
  const schema = Joi.object({
    company_logo: Joi.binary().optional(),
    buisness_stream: Joi.string().required(),
    profile_description: Joi.string().required(),
    establishment_date: Joi.date().required(),
    company_website: Joi.string().uri().optional()
  });

  return schema.validate(companyProfile);
}
module.exports = { Company, validateCompanyAccount, validateCompanyProfile };