const mongoose = require("mongoose");
const Joi = require("joi");

const jobSeekerSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: String,
  password: String,
  contact_number: [String],
  gender: String,
  dob: Date,
  profile_details: {
    user_image: mongoose.Schema.Types.Buffer,
    education: [{
      certificate_degree_name: String,
      major: String,
      institue_university_name: String,
      starting_date: Date,
      completion_date: Date,
      percentage: Number,
      cgpa: Number
    }],
    experience: [{
      job_title: String,
      company_name: String,
      location: String,
      description: String,
      start_date: Date,
      end_date: Date
    }],
    skill_set: [String],
    resume: mongoose.Schema.Types.Buffer
  },
  profile_completed: {
    type: Boolean,
    default: false
  },
  created_at: { type: Date, default: Date.now },
  updated_at: Date
});

const JobSeeker = mongoose.model('JobSeeker', jobSeekerSchema);

const validateJobSeekerAccount = function (jobSeekerAccount) {
  const schema = Joi.object({
    first_name: Joi.string().min(2).max(50).required(),
    last_name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    contact_number: Joi.array().items(Joi.string().pattern(/^\d{10}$/)).min(1).required(),
    gender: Joi.string().valid('Male', 'Female').required(),
    dob: Joi.date().iso().required()
  });

  return schema.validate(jobSeekerAccount);
}

const validateJobSeekerProfile = function (jobSeekerProfile) {
  const schema = Joi.object({
    user_image: Joi.binary().required(),
    education: Joi.array().items(Joi.object({
      certificate_degree_name: Joi.string().required(),
      major: Joi.string().required(),
      institue_university_name: Joi.string().required(),
      starting_date: Joi.date().required(),
      completion_date: Joi.date().required(),
      percentage: Joi.number().optional(),
      cgpa: Joi.number().optional()
    })).min(1).required(),
    experience: Joi.array().items(Joi.object({
      job_title: Joi.string().required(),
      company_name: Joi.string().required(),
      location: Joi.string().required(),
      description: Joi.string().required(),
      start_date: Joi.date().required(),
      end_date: Joi.date().required()
    })).min(1).optional(),
    skill_set: Joi.array().items(Joi.string()).min(1).required(),
    resume: Joi.binary().optional()
  });

  return schema.validate(jobSeekerProfile);
}

module.exports = { JobSeeker, validateJobSeekerAccount, validateJobSeekerProfile };