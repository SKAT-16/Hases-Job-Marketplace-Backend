require('dotenv').config();
const express = require('express');
const mongoose = require("mongoose");
const jobSeekersRoute = require('./routes/job_seekers.route');
const employersRoute = require('./routes/companies.route');
const authRoute = require('./routes/auth.route');
const registerRoute = require('./routes/register.route');
const vacanciesRoute = require('./routes/vacancies.route');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api/job-seeker', jobSeekersRoute);
app.use('/api/company', employersRoute);
app.use('/api/auth', authRoute);
app.use('/api/register', registerRoute);
app.use('/api/vacancy', vacanciesRoute);

const port = process.env.port || 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));
mongoose
    .connect('mongodb://127.0.0.1:27017/job-market-place')
    .then((mdb) => console.log(`Database connected on port ${mdb.connection.port}`))
    .catch((reason) => console.log(`\nError connecting to database: \n${reason}`));