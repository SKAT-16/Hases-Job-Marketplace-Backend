const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const authorization = require("../middleware/authorization");
const { Vacancy, validateVacancy } = require("../models/vacancy.model");
const JobCategory = require("../models/job_category.model");
const { Company } = require("../models/company.model");
const { JobSeeker } = require("../models/job_seeker.model");
const { Applicant } = require("../models/applicant.model");

router
  .get("/", authorization, async (req, res) => {
    const search = req.query.search;
    const type = req.query.type?.split(",");
    const category = req.query.category?.split(",") || "";
    const salary = Number(req.query.salary) || 0;
    const level = req.query.level;
    const pageNumber = Number(req.query.pageNumber) || 1;
    const pageSize = 10;

    const query = {};
    if (search) {
      query.$or = [
        { company_name: new RegExp(search, "i") },
        { title: new RegExp(search, "i") },
        { location: new RegExp(search, "i") },
      ];
    }

    if (category && category.length > 0) {
      query.job_category = { $in: category };
    }

    if (type && type.length > 0) {
      query.employment_type = { $in: type };
    }

    if (salary) {
      query.salary = { $gte: salary };
    }

    if (level) {
      query.job_level = level;
    }

    const job_seeker = await JobSeeker.findOne({ user_id: req.user_id });
    const appliedVacancies = await Applicant.find({
      job_seeker_id: job_seeker._id,
    }).distinct("vacancy_id");

    query._id = { $nin: appliedVacancies };
    query.openings = { $gt: 0 };

    const vacancyCount = await Vacancy.countDocuments(query);
    let pagedVacancies = [];
    if (vacancyCount !== 0)
      pagedVacancies = await Vacancy.find(query)
        .sort("created_at: -1")
        .populate("company_id", "company_name company_logo")
        .populate("job_category", "category_name")
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize);

    res.send({ pagedVacancies, vacancyCount });
  })
  .get("/my-vacancy/:id", authorization, async (req, res) => {
    let company = await Company.findOne({ user_id: req.user_id });
    const vacancy = await Vacancy.findOne({
      _id: req.params.id,
      company_id: company._id,
    });

    res.send(vacancy);
  })
  .get("/my-vacancies", authorization, async (req, res) => {
    let company = await Company.findOne({ user_id: req.user_id });
    const vacancies = await Vacancy.find({ company_id: company._id })
      .sort("created_at")
      .select(
        "_id title job_category employment_type openings salary job_level"
      )
      .populate("job_category", "category_name");

    res.send(vacancies);
  })
  .get("/categories", authorization, async (req, res) => {
    let categories = await JobCategory.find({})
      .select("_id category_name")
      .sort("category_name");
    res.send(categories);
  })
  .get("/:category_id/skills", authorization, async (req, res) => {
    const category_id = req.params.category_id;
    let skills = await JobCategory.findOne({ _id: category_id }).select(
      "required_skills"
    );
    res.send(skills);
  })
  .post("/new", authorization, async (req, res) => {
    const { error } = validateVacancy(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const company = await Company.findOne({ user_id: req.user_id });
    req.body.company_id = new mongoose.Types.ObjectId(company._id);
    let vacancy = new Vacancy(req.body);
    vacancy = await vacancy.save();

    res.send(`Vacancy: ${vacancy._id} saved!`);
  })
  .put("/edit", authorization, async (req, res) => {
    const { error } = validateVacancy(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let vacancy = await Vacancy.findById(req.body.vacancy_id);
    if (!vacancy) return res.status(400).send("Vacancy not found!");

    vacancy.set(req.body);
    vacancy = await vacancy.save();

    res.send(`Vacancy: ${vacancy._id} updated!`);
  });

module.exports = router;
