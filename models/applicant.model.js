const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  vacancy_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vacancy' },
  job_seeker_id: { type: mongoose.Schema.Types.ObjectId, ref: 'JobSeeker' },
  apply_date: { type: Date, default: Date.now },
  cover_letter: String,
  status: String
});

const Applicant = mongoose.model('Applicant', applicantSchema);
const validateApplicant = function (applicant) {
  const schema = Joi.object({
    vacancy_id: Joi.string().required(),
    job_seeker_id: Joi.string().required(),
    apply_date: Joi.date().default(Date.now),
    cover_letter: Joi.string(),
    status: Joi.string()
  });

  return schema.validate(exampleData);
}

module.exports = { Applicant, validateApplicant };