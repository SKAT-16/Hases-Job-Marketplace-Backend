const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const authorization = require("../middleware/authorization");
const { Vacancy, validateVacancy } = require("../models/vacancy.model");
const JobCategory = require("../models/job_category.model");
const { Company } = require("../models/company.model");
const { Applicant, validateApplicant } = require("../models/applicant.model");

router
  .get("/my-applications", authorization, async (req, res) => {
    const applications = await Applicant.find({
      job_seeker_id: req.user_id,
    })
      .populate("vacancy_id", "title")
      .populate("job_seeker_id", "name");
    res.send(applications);
  })
  .get("/my-applicants", authorization, async (req, res) => {
    const applicants = await Applicant.find({
      vacancy_id: req.body.vacancy_id,
    })
      .populate("vacancy_id", "title")
      .populate("job_seeker_id", "name");
    res.send(applicants);
  })
  .post("/apply", authorization, async (req, res) => {
    const { error } = validateApplicant(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const applicant = new Applicant({
      cover_letter: req.body.cover_letter,
      job_seeker_id: req.user_id,
      vacancy_id: req.body.vacancy_id,
    });

    const result = await applicant.save();
    res.send(result);
  })
  .put("/update-status", authorization, async (req, res) => {
    const applicant = await Applicant.find({
      job_seeker_id: req.body.job_seeker_id,
      vacancy_id: req.body.vacancy_id,
    });
    if (!applicant) return res.status(400).send("Applicant not found!");

    applicant.status = req.body.status;
    const result = await applicant.save();

    res.send(result);
  });

module.exports = router;
