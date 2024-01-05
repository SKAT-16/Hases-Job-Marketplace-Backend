const mongoose = require("mongoose");
const Joi = require("joi");

const jobSeekerSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  first_name: String,
  last_name: String,
  personal_email: String,
  phone: String,
  gender: String,
  dob: Date,

  user_image: {
    type: String,
    default:
      "https://www.dropbox.com/scl/fi/qn6t64ifr437x5scy0dli/default-profile.png?rlkey=2hvb0wmhvw43m1zp8m91fns7b&dl=0&raw=1",
  },
  education: [
    {
      certificate_degree_name: String,
      major: String,
      institute_university_name: String,
      starting_date: Date,
      completion_date: Date,
      percentage: { type: Number, default: 0 },
      cgpa: { type: Number, default: 0 },
    },
  ],
  experience: [
    {
      job_title: String,
      company_name: String,
      location: String,
      description: String,
      start_date: Date,
      end_date: Date,
    },
  ],
  job_set: [String],
  skill_set: [String],
  resume: {
    type: String,
    default: "",
  },

  profile_completed: {
    type: Boolean,
    default: false,
  },
  created_at: { type: Date, default: Date.now },
  updated_at: Date,
});

const JobSeeker = mongoose.model("JobSeeker", jobSeekerSchema);

const validateJobSeekerProfile = function (jobSeekerProfile) {
  const schema = Joi.object({
    first_name: Joi.string().min(2).max(50).required(),
    last_name: Joi.string().min(2).max(50).required(),
    personal_email: Joi.string().email().required(),
    phone: Joi.string()
      .pattern(/^(\+251|0)[1-57-9]\d{8}$/)
      .required(),
    gender: Joi.string().valid("Male", "Female").required(),
    dob: Joi.date().iso().required(),

    user_image: Joi.string().optional(),
    education: Joi.array()
      .items(
        Joi.object({
          certificate_degree_name: Joi.string().required(),
          major: Joi.string().required(),
          institute_university_name: Joi.string().required(),
          starting_date: Joi.date().required(),
          completion_date: Joi.date().required(),
          percentage: Joi.number().optional(),
          cgpa: Joi.number().required(),
        })
      )
      .min(1)
      .required(),
    experience: Joi.array()
      .items(
        Joi.object({
          job_title: Joi.string().required(),
          company_name: Joi.string().required(),
          location: Joi.string().required(),
          description: Joi.string().required(),
          start_date: Joi.date().required(),
          end_date: Joi.date().required(),
        })
      )
      .optional(),
    job_set: Joi.array().items(Joi.string().required()).min(1).required(),
    skill_set: Joi.array().items(Joi.string().required()).min(1).required(),
    resume: Joi.string().optional(),
  });

  return schema.validate(jobSeekerProfile);
};

const checkJobSeekerProfileCompletion = (jobSeekerProfile) => {
  // Check if the profile_completed field is set to true
  if (jobSeekerProfile.profile_completed === true) {
    return true; // Profile is complete
  } else {
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
      resume,
    } = jobSeekerProfile;

    return Boolean(
      first_name &&
        last_name &&
        personal_email &&
        phone &&
        gender &&
        dob &&
        education &&
        education.length > 0 &&
        experience &&
        job_set &&
        job_set.length > 0 &&
        skill_set &&
        skill_set.length > 0 &&
        (user_image || user_image === "") &&
        (resume || resume === "")
    );
  }
};

module.exports = {
  JobSeeker,
  checkJobSeekerProfileCompletion,
  validateJobSeekerProfile,
};
