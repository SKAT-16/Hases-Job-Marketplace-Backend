const Joi = require("joi");
const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  company_name: String,
  company_email: String,
  phone: String,

  company_logo: {
    type: String,
    default: "",
  },
  buisness_stream: String,
  profile_description: String,
  establishment_date: Date,
  company_website: {
    type: String,
    default: "-"
  },

  profile_completed: {
    type: Boolean,
    default: false
  },
  created_at: { type: Date, default: Date.now },
  updated_at: Date
});

const Company = mongoose.model('Company', companySchema);

const validateCompanyProfile = function (companyProfile) {
  const schema = Joi.object({
    company_name: Joi.string().min(2).required(),
    company_email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^(\+251|0)[1-57-9]\d{8}$/).required(),

    buisness_stream: Joi.string().required(),
    profile_description: Joi.string().required(),
    establishment_date: Joi.date().required(),
    company_website: Joi.string().optional(),
    company_logo: Joi.string().required(),
  });

  return schema.validate(companyProfile);
}

const checkCompanyProfileCompletion = (companyProfile) => {
  // Check if the profile_completed field is set to true
  if (companyProfile.profile_completed === true) {
    return true; // Profile is complete
  } else {
    const {
      company_name,
      company_email,
      phone,
      company_logo,
      buisness_stream,
      profile_description,
      establishment_date,
      company_website
    } = companyProfile;

    if (
      company_name &&
      company_email &&
      phone &&
      company_logo &&
      buisness_stream &&
      profile_description &&
      establishment_date &&
      company_website
    ) {
      return true; // Profile is complete
    } else {
      return false; // Profile is incomplete
    }
  }
};

module.exports = { Company, checkCompanyProfileCompletion, validateCompanyProfile };