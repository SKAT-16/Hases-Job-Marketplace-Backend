const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authorization = require('../middleware/authorization');
const { Vacancy, validateVacancy } = require('../models/vacancy.model');

router
  .get('/', authorization, async (req, res) => {
    const search = req.query.search;
    const type = req.query.type?.split(',');
    const category = req.query.category?.split(',') || '';
    const salary = Number(req.query.salary) || 0;
    const level = req.query.level;
    const pageNumber = Number(req.query.pageNumber) || 1;
    const pageSize = 10;

    const query = {};
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i')}
      ]
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

    console.log(query);

    const vacancies = await Vacancy.find(query)
      .select('_id company_id company_name title job_category employment_type job_level')
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize); const totalPages = Math.ceil(vacancies.length / pageSize);

    res.send({ vacancies, totalPages });
  });

router
  .post('/new', authorization, async (req, res) => {
    const { error } = validateVacancy(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    req.body.company_id = new mongoose.Types.ObjectId(req.user_id);
    let vacancy = new Vacancy(req.body);
    vacancy = await vacancy.save();

    res.send(`Vacancy: ${vacancy._id} saved!`);
  })
  .post('/many', async (req, res) => {
    const vacancies = req.body;
    const insertedVacancies = await Vacancy.insertMany(vacancies);
    res.send(`Inserted ${insertedVacancies.length} vacancies successfully!`);
  });

module.exports = router;