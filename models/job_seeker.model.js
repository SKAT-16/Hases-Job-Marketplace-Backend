const mongoose = require("mongoose");
const Joi = require("joi");

const jobSeekerSchema = new mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,

  first_name: String,
  last_name: String,
  personal_email: String,
  phone: String,
  gender: String,
  dob: Date,

  user_image: {
    type: String,
    default: "",
  },
  education: [{
    certificate_degree_name: String,
    major: String,
    institue_university_name: String,
    starting_date: Date,
    completion_date: Date,
    percentage: { type: Number, default: 0 },
    cgpa: { type: Number, default: 0 }
  }],
  experience: [{
    job_title: String,
    company_name: String,
    location: String,
    description: String,
    start_date: Date,
    end_date: Date
  }],
  job_set: [mongoose.Schema.Types.ObjectId],
  skill_set: [String],
  resume: {
    type: String,
    default: "",
  },

  profile_completed: {
    type: Boolean,
    default: false
  },
  created_at: { type: Date, default: Date.now },
  updated_at: Date
});

const JobSeeker = mongoose.model('JobSeeker', jobSeekerSchema);

const validateJobSeekerProfile = function (jobSeekerProfile) {
  const schema = Joi.object({
    first_name: Joi.string().min(2).max(50).required(),
    last_name: Joi.string().min(2).max(50).required(),
    personal_email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^(\+251|0)[1-57-9]\d{8}$/).required(),
    gender: Joi.string().valid('Male', 'Female').required(),
    dob: Joi.date().iso().required(),

    user_image: Joi.string().required(),
    education: Joi.array().items(Joi.object({
      certificate_degree_name: Joi.string().required(),
      major: Joi.string().required(),
      institue_university_name: Joi.string().required(),
      starting_date: Joi.date().required(),
      completion_date: Joi.date().required(),
      percentage: Joi.number().optional(),
      cgpa: Joi.number().required()
    })).min(1).required(),
    experience: Joi.array().items(Joi.object({
      job_title: Joi.string().required(),
      company_name: Joi.string().required(),
      location: Joi.string().required(),
      description: Joi.string().required(),
      start_date: Joi.date().required(),
      end_date: Joi.date().required()
    })).optional(),
    job_set: Joi.array().items(Joi.string().required()).min(1).required(),
    skill_set: Joi.array().items(Joi.string().required()).min(1).required(),
    resume: Joi.string().optional()
  });

  return schema.validate(jobSeekerProfile);
}

const checkJobSeekerProfileCompletion = (jobSeekerProfile) => {
  // Check if the profile_completed field is set to true
  if (jobSeekerProfile.profile_completed === true) {
    return true; // Profile is complete
  } else {
    // Check if required profile details are present
    const {
      first_name,
      last_name,
      personal_email,
      phone,
      gender,
      dob,
      user_image,
      education,
      experience,
      job_set,
      skill_set,
      resume
    } = jobSeekerProfile;

    if (
      first_name &&
      last_name &&
      personal_email &&
      phone &&
      gender &&
      dob &&
      user_image &&
      education &&
      education.length > 0 &&
      experience &&
      experience.length > 0 &&
      job_set &&
      job_set.length > 0 &&
      skill_set &&
      skill_set.length > 0 &&
      resume
    ) {
      return true; // Profile is complete
    } else {
      return false; // Profile is incomplete
    }
  }
};

module.exports = { JobSeeker, checkJobSeekerProfileCompletion, validateJobSeekerProfile };