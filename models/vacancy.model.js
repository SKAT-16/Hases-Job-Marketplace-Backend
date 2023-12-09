const mongoose = require('mongoose');

const vacancySchema = new mongoose.Schema({
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  title: String,
  description: String,
  location: String,
  job_category: String,
  skill_set: [String],
  created_at: { type: Date, default: Date.now },
  updated_at: Date
});

const Vacancy = mongoose.model('Vacancy', vacancySchema);
const validateVacancy = function (vacancy) {
  const schema = Joi.object({
    company_id: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    job_category: Joi.string().required(),
    skill_set: Joi.array().items(Joi.string()),
  });

  return schema.validate(vacancy);
}

module.exports = { Vacancy, validateVacancy };