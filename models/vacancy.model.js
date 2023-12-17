const mongoose = require('mongoose');
const Joi = require("joi");

const vacancySchema = new mongoose.Schema({
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  
  title: String,
  description: String,
  location: String,

  job_category: { type: mongoose.Schema.Types.ObjectId, ref: 'JobCategory' },
  job_skills: [String],

  openings: Number,
  employment_type: String,
  salary: Number,
  job_level: String,

  created_at: { type: Date, default: Date.now },
  updated_at: Date
});

const Vacancy = mongoose.model('Vacancy', vacancySchema);
const validateVacancy = function (vacancy) {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),

    job_category: Joi.string().required(),
    job_skills: Joi.array().items(Joi.string().required()).min(1).required(),

    openings: Joi.number().min(1),
    employment_type: Joi.string(),
    salary: Joi.number().min(0).required(),
    job_level: Joi.string().required(),
  });

  return schema.validate(vacancy);
}

module.exports = { Vacancy, validateVacancy };