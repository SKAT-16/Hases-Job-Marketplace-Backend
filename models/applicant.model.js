const Joi = require("joi");
const mongoose = require("mongoose");

const applicantSchema = new mongoose.Schema({
  vacancy_id: { type: mongoose.Schema.Types.ObjectId, ref: "Vacancy" },
  job_seeker_id: { type: mongoose.Schema.Types.ObjectId, ref: "JobSeeker" },
  apply_date: { type: Date, default: Date.now },
  cover_letter: String,
  status: {
    type: String,
    enum: ["accepted", "rejected", "pending"],
    default: "pending",
  },
});

const Applicant = mongoose.model("Applicant", applicantSchema);
const validateApplicant = function (applicant) {
  const schema = Joi.object({
    vacancy_id: Joi.string().required(),
    cover_letter: Joi.string().required(),
  });

  return schema.validate(applicant);
};

module.exports = { Applicant, validateApplicant };
