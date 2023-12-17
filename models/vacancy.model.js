const mongoose = require('mongoose');
const Joi = require("joi");

const vacancySchema = new mongoose.Schema({
  company_id: mongoose.Schema.Types.ObjectId,
  company_name: String,
  company_logo: String,

  title: String,
  description: String,
  location: String,

  job_category: mongoose.Schema.Types.ObjectId,
  job_skills: [String],

  employment_type: String,
  salary: Number,
  job_level: String,

  created_at: { type: Date, default: Date.now },
  updated_at: Date
});

const Vacancy = mongoose.model('Vacancy', vacancySchema);
const validateVacancy = function (vacancy) {
  const schema = Joi.object({
    company_name: Joi.string().required(),
    company_logo: Joi.string().required(),

    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),

    job_category: Joi.string().required(),
    job_skills: Joi.array().items(Joi.string().required()).min(1).required(),

    employment_type: Joi.string(),
    salary: Joi.number().min(0).required(),
    job_level: Joi.string().required(),
  });

  return schema.validate(vacancy);
}

module.exports = { Vacancy, validateVacancy };