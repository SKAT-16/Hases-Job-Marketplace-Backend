const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const authorization = require("../middleware/authorization");
const { Vacancy, validateVacancy } = require("../models/vacancy.model");
const JobCategory = require("../models/job_category.model");
const { Company } = require("../models/company.model");
const { JobSeeker } = require("../models/job_seeker.model");
const { Applicant, validateApplicant } = require("../models/applicant.model");

router
  .get("/my-application", authorization, async (req, res) => {
    req.body.job_seeker_id = new mongoose.Types.ObjectId(
      await JobSeeker.findOne({ user_id: req.user_id })
    );
    const application = await Applicant.findOne({
      job_seeker_id: req.body.job_seeker_id,
    }).populate(
      "vacancy_id",
      "title description location job_category job_skills openings employment_type salary job_level"
    );

    res.send(application);
  })
  .get("/all-applications", authorization, async (req, res) => {
    req.body.job_seeker_id = new mongoose.Types.ObjectId(
      await JobSeeker.findOne({ user_id: req.user_id })
    );
    const applications = await Applicant.find({
      job_seeker_id: req.body.job_seeker_id,
    })
      .sort("status")
      .populate({
        path: "vacancy_id",
        select:
          "title location description openings employment_type salary job_level job_category job_skills company_id",
        populate: [
          {
            path: "company_id",
            select: "company_name company_logo",
          },
          {
            path: "job_category",
            select: "category_name",
          },
        ],
      });

    res.send(applications);
  })
  .get("/my-applicant", authorization, async (req, res) => {
    const applicant = await Applicant.findOne({
      job_seeker_id: req.user_id,
      vacancy_id: req.body.vacancy_id,
    }).populate("job_seeker_id");

    res.send(applicant);
  })
  .get("/all-applicants", authorization, async (req, res) => {
    const applicants = await Applicant.find({
      vacancy_id: req.body.vacancy_id,
    })
      .sort("apply_date: -1")
      .populate("job_seeker_id", "first_name last_name user_image resume")
      .populate(
        "vacancy_id",
        "title job_category job_skills openings employment_type job_level"
      );

    res.send(applicants);
  })
  .post("/apply", authorization, async (req, res) => {
    const { error } = validateApplicant(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    req.body.job_seeker_id = new mongoose.Types.ObjectId(
      await JobSeeker.findOne({ user_id: req.user_id })
    );
    const applicant = new Applicant({
      cover_letter: req.body.cover_letter,
      job_seeker_id: req.body.job_seeker_id,
      vacancy_id: req.body.vacancy_id,
    });

    const result = await applicant.save();
    res.send(result);
  })
  .put("/update-status", authorization, async (req, res) => {
    const applicant = await Applicant.findOne({
      job_seeker_id: req.body.job_seeker_id,
      vacancy_id: req.body.vacancy_id,
    });
    if (!applicant) return res.status(400).send("Applicant not found!");

    applicant.status = req.body.status;
    const result = await applicant.save();

    res.send(result);
  })
  .delete("/my-application/:id", authorization, async (req, res) => {
    req.body.job_seeker_id = new mongoose.Types.ObjectId(
      await JobSeeker.findOne({ user_id: req.user_id })
    );

    const application = await Applicant.findByIdAndDelete({
      _id: req.params.id,
      job_seeker_id: req.body.job_seeker_id,
    });

    if (!application) return res.status(400).send("Applicant not found!");
    res.send("Application:" + application._id + " deleted!");
  });

module.exports = router;
